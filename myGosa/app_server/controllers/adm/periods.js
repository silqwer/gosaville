/**
 * http://usejsdoc.org/
 */

const periods =  require('../../models/adm/periods');
const apply =  require('../../models/adm/apply');
const multer = require('multer');			//파일업로드 프레임워크? 
const storage = multer.diskStorage({		//업로드 파일 경로 설정 
	destination: function (req, file, cb) {
		cb(null, 'public/adm/excel/');	//콜백함수를 통해 전송된 파일을 저장할 디렉토리 설정 
	}, 
	
	filename: function(req, file, cb) {
		cb(null, file.originalname);	//콜백함수를 통해 전송된 파일 이름을 설정 
	}
});

//기수 관리  
module.exports.periods = (req, res) =>{
	res.redirect('/admin/periods/list/1');
};

module.exports.listPage = (req, res) => {
	
	let page = req.params.page;
	let word = req.params.word;
	
	periods.count(word, function(err, rows){
		
		if(rows === undefined){
			//조회 결과 없음 
			res.render('adm/periods/list', { 
				'title' : '기수 관리',
				'userInfo' : req.user,
				'page' : page, 
				'result' : result
			});
		
			return;
		
		}else{
			result = true;
		}
		
		page = parseInt(page, 10);					// 십진수 만들기 
		let size = 10; 								// 한 페이지에 보여줄 개수		
		let begin = (page - 1) * size;				// 시작 번호
		let cnt = rows[0].CNT;						// 전체 글 개수 
		let totalPage = Math.ceil(cnt / size);		// 전체 페이지 수 
		let pageSize = 10;							// 페이지 링크 갯수 
		
		let startPage = Math.floor((page-1) / pageSize) * pageSize + 1;
		let endPage = startPage + (pageSize - 1);
		
		if(endPage > totalPage){
			endPage = totalPage;
		}
		
		let max = cnt - ((page-1) * size);			// 전체 글이 존재하는 개수
		
		periods.list(word, begin, size, function(err, rows){
			
			if (err) {
				console.error(err);
				throw err;
			}
			
			let search = '';
			
			if(word !== undefined){
				search = '/' + word;
			}
			
			
			res.render('adm/periods/list', { 
				'title' : '기수 관리',
				'userInfo' : req.user,
				'list' : rows, 
				'page' : page, 
				'pageSize' : pageSize,
				'startPage' : startPage,
				'endPage' : endPage,
				'totalPage' : totalPage,
				'max' : max,
				'word' : word,
				'search' : search,
				'result' : result
			}); 
		});
	});
};

module.exports.readPage = (req, res) => {
	let page = req.params.page; 
	let seq = req.params.seq; 
	
	periods.read(seq, function(err, rows){
	
		res.render('adm/periods/read', { 
			'title' : '고사장 관리',
			'userInfo' : req.user,
			'periods' : rows[0], 
			'page' : page
		}); 
	});
};

module.exports.insertPage = (req, res) =>{
	let page = req.params.page; 
	
	periods.schedule(function(err, rows){
		let schedule = rows;
		
		periods.exam(function(err, rows){
			res.render('adm/periods/insert', { 
				'title' : '기수 등록',
				'userInfo' : req.user, 
				'page' : page, 
				'schedule' : schedule, 
				'exam' : rows
			});
		});
	});
};

module.exports.insert = (req, res) => {
	
	let arr = req.body.ARR;
	let jsonString = arr.replace(/'/g, "\"");
	let jsonPeriod = JSON.parse(jsonString);
	
	for(let i=0; i<jsonPeriod.length; ++i){
		let examClass = jsonPeriod[i].examClass;
		for(let j=0; j<examClass; ++j){
			let period = {
					'schSeq' : jsonPeriod[i].schSeq,
					'examSeq' : jsonPeriod[i].examSeq,
					'examClass' : j+1
			};
			
			periods.insert(period, function(err, rows){
				if (err) {
					console.error(err);
					throw err;
				}
			});
		}
		
	}
	
	res.redirect('/admin/periods/list/1');
	
};

module.exports.updatePage = (req, res) => {
	let page = req.params.page; 
	let seq = req.params.seq; 
	
	periods.selected_periods(seq, function(err, rows){
		let period = rows[0];
	
		periods.selected_schedule(seq, function(err, rows){
			let schedule = rows;
			
			periods.selected_exam(seq, function(err, rows){
		
				res.render('adm/periods/update', { 
					'title' : '기수 수정',
					'userInfo' : req.user, 
					'page' : page, 
					'schedule' : schedule,
					'selected_schedule_seq' : seq, 
					'selected_schedul_name' : period.SCHEDULE_NAME,
					'exam' : rows
				});
				
			});
		});
	});
};

module.exports.checkApply = (req, res) => {
	
	let seq = req.body.SCHEDULE_SEQ;
	
	periods.countApply(seq, function(err, rows){
		
		if (err) {
			console.error(err);
			throw err;
		}
		
		if(rows[0] > 0){
			res.send({
				'result': false, 
				'seq': seq
			});
		}else{
			res.send({
				'result': true, 
				'seq': seq
			});
		}
	});
	
};

module.exports.update = (req, res) =>{
	
	let page = req.body.PAGE; 
	let seq = req.body.SCHEDULE_SEQ; 
	let arr = req.body.ARR;
	let jsonString = arr.replace(/'/g, "\"");
	let jsonPeriod = JSON.parse(jsonString);
	
	apply.delete(seq, function(err, rows){
		
		periods.delete(seq, function(err, rows){
			
			for(let i=0; i<jsonPeriod.length; ++i){
				
				periods.insert(jsonPeriod[i], function(err, rows){
					if (err) {
						console.error(err);
						throw err;
					}
					
				});
			}
			
			res.redirect('/admin/periods/list/'+page);
		});
	});
};

module.exports.delete = (req, res) => {
	let page = req.body.PAGE; 
	let seq = req.body.SCHEDULE_SEQ; 
	
	apply.delete(seq, function(err, rows){
		
		periods.delete(seq, function(err, rows){
			
			res.redirect('/admin/periods/list/'+page);
		});
	});
};

//기수 엑셀 등록 페이지 uploadPage
module.exports.uploadPage = (req, res) => {
	
	periods.schedule(function(err, rows){
		let schedule = rows;
		
		res.render('adm/periods/excel', { 
			'title' : '기수 엑셀 등록',
			'userInfo' : req.user, 
			'schedule' : schedule
		}); 
	});
	
		
};

//기수 엑셀 등록 페이지 uploadPage
module.exports.upload = (req, res) => {
	
	var upload = multer({
		storage:storage, 				//저장경로
		fileFilter : function(req, file, callback){		//파일필터
			if(['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1){
				return callback(new Error('Wrong extension type'));
			}
			callback(null, true);
		}
	}).single('excel');
	
	var excelToJson = null;
	
	upload(req, res, function(err){
		if(err){
			res.json({error_code:1, err_desc:err, err_msg:'오류입니다.'});
			return;
		}
		
		if(!req.file){
			res.json({error_code:1, err_desc:'No file passed'});
			return;
		}
		
		//엑셀 파일 컨버팅 시작, 엑셀 > Json
		if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
			//파일 확장자를 통해서 구분 
			excelToJson = require('xlsx-to-json-lc'); 
		}else{
			excelToJson = require('xls-to-json-lc'); 
		}
		
		try{
			excelToJson({
				input: req.file.path, 			//엑셀 파일이 업로드 된 경로 
				output: null,					//Json 파일이 저장될 경로 
				lowerCaseHeaders: true
			}, function(err, result){
				if(err){
					res.json({error_code:1, err_desc:err, data: null});
				}
				
				//result로 json 데이터가 넘어 온다.
				res.json({error_code:0, err_desc:null, data: result});
			});
		} catch (e) {
			
			console.log('req.file.path:'+req.file.path); 
			console.log('err:'+e); 
			res.json({error_code:1, err_desc:'Corupted excel file', err_msg:e});
		}
		
	});
};


