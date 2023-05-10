const router = require('express').Router();
const { Signup, VerifyOtp, Signin, ParentCode, AddParentCode,
        AddChild, DeleteChild, GetChild, EditChild, 
        AddTask, DeleteTask, GetTask,GetChildTask, EditTask, 
        TaskCompleted, GetCompletedTask, ConfirmCompletedTask,
        AddPrize, DeletePrize, GetPrize, EditPrize,  
    } = require('../Controllers/userController');

router.route('/signup').post(Signup)
router.route('/verify').post(VerifyOtp)
router.route('/signin').post(Signin)

router.route('/parentcode').post(ParentCode)
router.route('/addparentcode').post(AddParentCode)

router.route('/user/addChild').post(AddChild)
router.route('/user/deleteChild').post(DeleteChild)
router.route('/user/getChild').get(GetChild)
router.route('/user/editChild').post(EditChild)

router.route('/task/addTask').post(AddTask)
router.route('/task/deleteTask').post(DeleteTask)
router.route('/task/getTask').get(GetTask)
router.route('/task/getChildTask').get(GetChildTask)
router.route('/task/editTask').post(EditTask)

router.route('/task/taskCompleted').post(TaskCompleted)
router.route('/task/getCompletedTask').get(GetCompletedTask)
router.route('/task/confirmCompletedTask').post(ConfirmCompletedTask)

router.route('/prize/addPrize').post(AddPrize)
router.route('/prize/deletePrize').post(DeletePrize)
router.route('/prize/getPrize').get(GetPrize)
router.route('/prize/editPrize').post(EditPrize)
module.exports = router

