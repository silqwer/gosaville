var express = require('express');
var router = express.Router();
var ctrlMain = require('../../controllers/adm/main');
var ctrlExam = require('../../controllers/adm/exam');
var ctrlComment = require('../../controllers/adm/comment');
var ctrlSchedule = require('../../controllers/adm/schedule');
var ctrlPeriods = require('../../controllers/adm/periods');
var ctrlApply = require('../../controllers/adm/apply');
var ctrlUsers = require('../../controllers/adm/users');
var ctrlDepart = require('../../controllers/adm/department');
var ctrlNotice = require('../../controllers/adm/notice');

var multer = require('multer');			//파일업로드 프레임워크? 
var storage = multer.diskStorage({		//업로드 파일 경로 설정 
	destination: function (req, file, cb) {
		cb(null, 'public/adm/excel/');	//콜백함수를 통해 전송된 파일을 저장할 디렉토리 설정 
	}, 
	
	filename: function(req, file, cb) {
		cb(null, file.originalname);	//콜백함수를 통해 전송된 파일 이름을 설정 
	}
});
var upload = multer({storage:storage}); //업로드 객체 생성 


module.exports = function (passport){
	var ensureAuthenticated = function (req, res, next){
		// 로그인이 되어 있으면, 다음 파이프라인으로 진행

	    if (req.isAuthenticated()) { return next(); }

	    // 나중에 관리자 권한 확인하고 접근 분리하도록 진행 
	    
	    // 로그인이 안되어 있으면, login 페이지로 진행
	    res.redirect('/admin/login');

	};
	
	router.get('/', ctrlMain.index);												// 관리자 메인 
	router.get('/main', ensureAuthenticated, ctrlMain.main);						// 관리자 홈 
	router.get('/login', ctrlMain.index);											// 관리자 로그인 
	router.get('/login/fail', ctrlMain.loginFail);											// 관리자 로그인 
	
	router.get('/logout', ctrlMain.logout);											// 관리자 로그아웃
	
	
	//스케줄 관리
	router.get('/schedule', ensureAuthenticated, ctrlMain.schedule);				// 일정 관리 
	router.post('/schedule/insert', ensureAuthenticated, ctrlSchedule.insert);		// 일정 등록 
	router.post('/schedule/delete', ensureAuthenticated, ctrlSchedule.delete);		// 일정 삭제 
	router.post('/schedule/update', ensureAuthenticated, ctrlSchedule.update);		// 일정 수정 
	router.post('/schedule/count', ensureAuthenticated, ctrlSchedule.count);		// 일정 횟수
	
	
	//고사장 관리 
	router.get('/exam', ensureAuthenticated, ctrlExam.exam);									// 고사장 관리 
	router.get('/exam/list/:page', ensureAuthenticated, ctrlExam.listPage);						// 고사장 관리 리스트 출력  
	router.get('/exam/list/:page/:seq', ensureAuthenticated, ctrlExam.readPage);				// 고사장 관리 글 읽기 페이지 호출
	router.get('/exam/list/:page/:category/:word', ensureAuthenticated, ctrlExam.listPage);   	// 고사장 검색 
	router.get('/exam/update/:page/:seq', ensureAuthenticated, ctrlExam.updatePage);			// 고사장 관리 글 수정 페이지 호출 
	router.post('/exam/update', ensureAuthenticated, ctrlExam.update);							// 고사장 관리 글 수정   
	router.post('/exam/delete', ensureAuthenticated, ctrlExam.delete);							// 고사장 관리 글 삭제 
	router.get('/exam/insert/:page', ensureAuthenticated, ctrlExam.insertPage);					// 고사장 등록 페이지 호출
	router.post('/exam/insert', ensureAuthenticated, ctrlExam.insert);							// 고사장 등록 
	
	
	
	//고사장 참여 이력관리 
	router.get('/exam/history', ensureAuthenticated, ctrlExam.history);								//고사장 참여 이력 관리 			
	router.get('/exam/history/list/:page', ensureAuthenticated, ctrlExam.historyListPage);			//고사장 참여 이력 리스트 출력  페이지
	router.get('/exam/history/list/:page/:category/:word', ensureAuthenticated, ctrlExam.historyListPage);  //고사장 참여 이력 검색 
	
	//고사장 후기 관리 
	router.get('/coment', ensureAuthenticated, ctrlComment.comment);								// 고사장 관리 
	router.get('/comment/list/:page', ensureAuthenticated, ctrlComment.listPage);					// 고사장 후기 리스트 출력
	router.get('/comment/list/:page/:category/:word', ensureAuthenticated, ctrlComment.listPage);  	// 고사장 후기 검색 
	router.get('/comment/update/:page/:number/:seq', ensureAuthenticated, ctrlComment.updatePage);	// 고사장 후기 수정 페이지 호출 
	router.post('/comment/delete', ensureAuthenticated, ctrlComment.delete);						// 고사장 후기 수정 페이지 호출 
	
	
	//기수관리 
	router.get('/periods', ensureAuthenticated, ctrlPeriods.periods);						// 기수 관리 
	router.get('/periods/list/:page', ensureAuthenticated, ctrlPeriods.listPage);			// 기수 관리 리스트 출력  
	router.get('/periods/list/:page/:word', ensureAuthenticated, ctrlPeriods.listPage);  	// 고사장 후기 검색 
	
	router.get('/periods/insert/:page', ensureAuthenticated, ctrlPeriods.insertPage);		// 기수 등록 페이지 호출
	router.post('/periods/insert', ensureAuthenticated, ctrlPeriods.insert);				// 기수 등록 
	router.get('/periods/update/:page/:seq', ensureAuthenticated, ctrlPeriods.updatePage);	// 기수 수정 페이지 호출 
	router.post('/periods/update', ensureAuthenticated, ctrlPeriods.update);				// 기수 수정
	router.post('/periods/check/apply', ensureAuthenticated, ctrlPeriods.checkApply);		// 신청 정보 체크 
	router.post('/periods/delete', ensureAuthenticated, ctrlPeriods.delete);				// 기수 정보 삭제 
	
	router.get('/periods/excel', ensureAuthenticated, ctrlPeriods.uploadPage);				// 기수 엑셀 등록 페이지
	router.post('/periods/excel/upload', ensureAuthenticated, ctrlPeriods.upload);			// 기수 엑셀 등록 페이지
	
	//신청관리 
	router.get('/apply', ensureAuthenticated, ctrlApply.apply);											// 신청 관리  
	router.get('/apply/list/:page', ensureAuthenticated, ctrlApply.listPage);							// 신청 관리 리스트 출력 
	router.get('/apply/list/:page/:schedule', ensureAuthenticated, ctrlApply.listPage);   				// 고사장 검색 
	router.get('/apply/list/:page/:schedule/:category/:word', ensureAuthenticated, ctrlApply.listPage); // 고사장 검색 
	router.get('/apply/stats', ensureAuthenticated, ctrlApply.stats);							// 신청 관리 통계 페이지 출력
	router.get('/apply/stats/closs', ensureAuthenticated, ctrlApply.closs);						// 신청 관리 마감 통계 페이지 출력 
	router.get('/apply/stats/closs/best', ensureAuthenticated, ctrlApply.best);					// 신청 관리 마감 통계 페이지 출력 
	router.get('/apply/stats/closs/worst', ensureAuthenticated, ctrlApply.worst);				// 신청 관리 마감 통계 페이지 출력 
	router.get('/apply/stats/visit', ensureAuthenticated, ctrlApply.visit);						// 신청 관리 고사장별 신청 랭킹 통계 페이지 출력 
	router.get('/apply/stats/visit/:seq', ensureAuthenticated, ctrlApply.visitPage);			// 신청 관리 고사장별 신청 랭킹 통계 페이지 출력 
	router.get('/apply/stats/accrue', ensureAuthenticated, ctrlApply.accrue);					// 신청 관리 연간 출석 고사 참여횟수 통계 페이지 출력 
	router.get('/apply/stats/accrue/:seq', ensureAuthenticated, ctrlApply.accruePage);			// 신청 관리 연간 출석 고사 참여횟수 통계 페이지 출력 
	router.get('/apply/stats/user', ensureAuthenticated, ctrlApply.user);						// 신청 관리 개일별 참석 고사장 비율 통계 페이지 출력 
	router.get('/apply/stats/user/:seq', ensureAuthenticated, ctrlApply.userPage);				// 신청 관리 개일별 참석 고사장 비율 통계 페이지 출력 
	
	
	
	//회원 관리 
	router.get('/users', ensureAuthenticated, ctrlUsers.users);									// 회원 관리 
	router.get('/users/list/:page', ensureAuthenticated, ctrlUsers.listPage);					// 회원 관리 리스트 출력 
	router.get('/users/list/:page/:category/:word', ensureAuthenticated, ctrlUsers.listPage);   // 회원 검색 
	router.get('/users/update/:page/:seq', ensureAuthenticated, ctrlUsers.updatePage);	// 회원 수정 페이지 호출
	router.post('/users/update', ensureAuthenticated, ctrlUsers.update);				// 회원 수정
	router.post('/users/delete', ensureAuthenticated, ctrlUsers.delete);				// 회원 삭제 
	
	//부서관리 
	router.get('/department', ensureAuthenticated, ctrlDepart.department);		// 부서 관리 
	router.post('/department/update', ensureAuthenticated, ctrlDepart.update);	// 부서 수정
	router.post('/department/delete', ensureAuthenticated, ctrlDepart.delete);	// 부서 삭제 
	router.post('/department/check', ensureAuthenticated, ctrlDepart.check);	// 부서 체크
	router.post('/department/insert', ensureAuthenticated, ctrlDepart.insert);	// 부서 수정
	
	//공지관리 
	router.get('/notice', ensureAuthenticated, ctrlNotice.notice);									// 공지 관리 
	router.get('/notice/list/:page', ensureAuthenticated, ctrlNotice.listPage);						// 공지사항 리스트 출력  
	router.get('/notice/list/:page/:category/:word', ensureAuthenticated, ctrlNotice.listPage);   	// 공지사항 검색 
	router.get('/notice/insert/:page', ensureAuthenticated, ctrlNotice.insertPage);			// 공지사항 등록 페이지 호출
	router.post('/notice/insert', ensureAuthenticated, ctrlNotice.insert);					// 공지사항 등록 
	router.get('/notice/update/:page/:seq', ensureAuthenticated, ctrlNotice.updatePage);	// 공지사항 수정 페이지 호출 
	router.post('/notice/update', ensureAuthenticated, ctrlNotice.update);					// 공지사항 수정
	router.post('/notice/delete', ensureAuthenticated, ctrlNotice.delete);					// 공지사항 삭제

	//로그인 
	router.post('/login', passport.authenticate('local-login', {
		successRedirect : '/admin/main',
		failureRedirect : '/admin/login/fail',
		failureFlash : true
	}));
	
	return router;
};
