'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { authAPI, setAuthToken } from '../../../lib/api'

export default function Login() {
  const router = useRouter()
  const [loginType, setLoginType] = useState('general')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyCode: '',
    employeeId: '',
    userName: '',
    department: '',
    customerNumber: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Prepare login credentials based on login type
      const credentials = loginType === 'tokyogas' 
        ? {
            customerNumber: formData.customerNumber,
            password: formData.password,
            loginType: 'tokyogas'
          }
        : {
            email: formData.email,
            password: formData.password,
            companyCode: formData.companyCode,
            employeeId: formData.employeeId,
            userName: formData.userName,
            department: formData.department,
            loginType: 'general'
          }

      // Call API login
      const response = await authAPI.login(credentials)
      
      // Store auth token
      if (response.token) {
        setAuthToken(response.token)
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        throw new Error('認証トークンが取得できませんでした')
      }
    } catch (err) {
      setError(err.message || 'ログインに失敗しました')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-custom flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-white shadow-2xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/80">
              Tech0 by scope3
            </Link>
            <p className="text-gray-600 mt-2">企業向けエネルギー管理</p>
          </div>

          <div className="tabs tabs-custom mb-6">
            <button 
              className={`tab tab-sm sm:tab-lg flex-1 ${loginType === 'general' ? 'tab-active' : ''}`}
              onClick={() => setLoginType('general')}
            >
              一般ログイン
            </button>
            <button 
              className={`tab tab-sm sm:tab-lg flex-1 ${loginType === 'tokyogas' ? 'tab-active' : ''}`}
              onClick={() => setLoginType('tokyogas')}
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

          <form onSubmit={handleLogin} className="space-y-4">
            {loginType === 'tokyogas' ? (
              <>
                <div className="mb-4">
                  <p className="text-center text-primary font-medium">
                    東京ガスのお客さま番号でログインできます
                  </p>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">お客さま番号</span>
                  </label>
                  <input 
                    type="text" 
                    name="customerNumber"
                    placeholder="お客さま番号を入力"
                    className="input input-bordered" 
                    value={formData.customerNumber || ''}
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
                    placeholder="パスワードを入力"
                    className="input input-bordered" 
                    value={formData.password}
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
                      <span className="hidden sm:inline">東京ガスアカウントで</span>ログイン
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

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">部署</span>
                  </label>
                  <input 
                    type="text" 
                    name="department"
                    placeholder="部署名を入力"
                    className="input input-bordered" 
                    value={formData.department}
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
                    placeholder="パスワードを入力"
                    className="input input-bordered" 
                    value={formData.password}
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
                      <Icon icon="carbon:login" className="text-lg" />
                      ログイン
                    </>
                  )}
                </button>
              </>
            )}

            <div className="divider">または</div>

            <div className="space-y-3">

              
              <button type="button" className="btn btn-outline w-full btn-md">
                <Icon icon="carbon:chat" className="text-lg" />
                LINEでログイン
              </button>
            </div>

            <div className="text-center mt-6">
              <Link href="/register" className="link link-primary">
                アカウントをお持ちでない方はこちら
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}