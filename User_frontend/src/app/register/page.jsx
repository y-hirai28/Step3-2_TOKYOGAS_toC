'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { authAPI } from '../../../lib/api'

export default function Register() {
  const router = useRouter()
  const [registerType, setRegisterType] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyCode: '',
    companyName: '',
    employeeId: '',
    userName: '',
    department: '',
    position: '',
    customerNumber: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      return false
    }
    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return false
    }
    return true
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      // Prepare registration data based on register type
      const registrationData = registerType === 'tokyogas' 
        ? {
            customerNumber: formData.customerNumber,
            password: formData.password,
            userName: formData.userName,
            registerType: 'tokyogas'
          }
        : {
            email: formData.email,
            password: formData.password,
            companyCode: formData.companyCode,
            companyName: formData.companyName,
            employeeId: formData.employeeId,
            userName: formData.userName,
            department: formData.department,
            position: formData.position,
            registerType: 'general'
          }

      // Call API register
      const response = await authAPI.register(registrationData)
      
      setSuccess('アカウントが正常に作成されました。ログインページに移動します...')
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (err) {
      setError(err.message || 'アカウント作成に失敗しました')
      console.error('Register error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-custom flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-white shadow-2xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/80">
              Tech0 by scope3
            </Link>
            <p className="text-gray-600 mt-2">アカウント作成</p>
          </div>

          <div className="tabs tabs-custom mb-6">
            <button 
              className={`tab tab-sm sm:tab-lg flex-1 ${registerType === 'general' ? 'tab-active' : ''}`}
              onClick={() => setRegisterType('general')}
            >
              一般登録
            </button>
            <button 
              className={`tab tab-sm sm:tab-lg flex-1 ${registerType === 'tokyogas' ? 'tab-active' : ''}`}
              onClick={() => setRegisterType('tokyogas')}
            >
              <span className="hidden sm:inline">東京ガス連携</span>
              <span className="sm:hidden">東京ガス</span>
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {registerType === 'tokyogas' ? (
              <>
                <div className="mb-4">
                  <p className="text-center text-primary font-medium text-sm">
                    東京ガス連携アカウント登録
                  </p>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">東京ガスお客さま番号</span>
                  </label>
                  <input 
                    type="text" 
                    name="customerNumber"
                    placeholder="お客さま番号を入力"
                    className="input input-bordered" 
                    value={formData.customerNumber}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">会社コード</span>
                  </label>
                  <input 
                    type="text" 
                    name="companyCode"
                    placeholder="会社コードを入力"
                    className="input input-bordered" 
                    value={formData.companyCode}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">社員番号</span>
                  </label>
                  <input 
                    type="text" 
                    name="employeeId"
                    placeholder="社員番号を入力"
                    className="input input-bordered" 
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">メールアドレス</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="メールアドレスを入力"
                    className="input input-bordered" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">お名前</span>
                  </label>
                  <input 
                    type="text" 
                    name="userName"
                    placeholder="お名前を入力"
                    className="input input-bordered" 
                    value={formData.userName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">部署</span>
                    </label>
                    <input 
                      type="text" 
                      name="department"
                      placeholder="部署名"
                      className="input input-bordered" 
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">役職</span>
                    </label>
                    <input 
                      type="text" 
                      name="position"
                      placeholder="役職名"
                      className="input input-bordered" 
                      value={formData.position}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">パスワード</span>
                  </label>
                  <input 
                    type="password" 
                    name="password"
                    placeholder="パスワードを入力（6文字以上）"
                    className="input input-bordered" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">パスワード確認</span>
                  </label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    placeholder="パスワードを再入力"
                    className="input input-bordered" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full btn-md sm:btn-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <Icon icon="carbon:connect" className="text-lg" />
                      <span className="hidden sm:inline">東京ガス連携で</span>アカウント作成
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">会社コード</span>
                  </label>
                  <input 
                    type="text" 
                    name="companyCode"
                    placeholder="会社コードを入力"
                    className="input input-bordered" 
                    value={formData.companyCode}
                    onChange={handleInputChange}
                    required 
                  />
                </div>


                <div className="form-control">
                  <label className="label">
                    <span className="label-text">社員番号</span>
                  </label>
                  <input 
                    type="text" 
                    name="employeeId"
                    placeholder="社員番号を入力"
                    className="input input-bordered" 
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">お名前</span>
                  </label>
                  <input 
                    type="text" 
                    name="userName"
                    placeholder="お名前を入力"
                    className="input input-bordered" 
                    value={formData.userName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">部署</span>
                    </label>
                    <input 
                      type="text" 
                      name="department"
                      placeholder="部署名"
                      className="input input-bordered" 
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">役職</span>
                    </label>
                    <input 
                      type="text" 
                      name="position"
                      placeholder="役職名"
                      className="input input-bordered" 
                      value={formData.position}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">メールアドレス</span>
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="メールアドレスを入力"
                    className="input input-bordered" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">パスワード</span>
                  </label>
                  <input 
                    type="password" 
                    name="password"
                    placeholder="パスワードを入力（6文字以上）"
                    className="input input-bordered" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">パスワード確認</span>
                  </label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    placeholder="パスワードを再入力"
                    className="input input-bordered" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full btn-md sm:btn-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <Icon icon="carbon:user-plus" className="text-lg" />
                      アカウント作成
                    </>
                  )}
                </button>
              </>
            )}

            <div className="text-center mt-6">
              <Link href="/login" className="link link-primary">
                すでにアカウントをお持ちの方はこちら
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}