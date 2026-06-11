import express from 'express'

import { register,loginUser,logoutUser, refreshToken } from '../controllers/authController.js'

const router= express.Router()



router.post('/register',register)
router.post('/login',loginUser)
router.post('/refresh',refreshToken)
router.post('/logout',logoutUser)

export default router