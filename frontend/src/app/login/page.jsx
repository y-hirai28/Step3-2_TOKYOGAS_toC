'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const [loginType, setLoginType] = useState('general')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyCode: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = (e) => {
    e.preventDefault()
    console.log('Login attempt:', { loginType, ...formData })
    // TODO: 実際のログイン処理を実装
  }

  return (
    <div className="min-h-screen bg-custom flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-white shadow-2xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <Link href="/" className="text-2xl font-bold text-blue-800 hover:text-blue-600">
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

          <form onSubmit={handleLogin} className="space-y-4">
            {loginType === 'tokyogas' ? (
              <>
                <div className="mb-4">
                  <p className="text-center text-blue-800 font-medium">
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

                <button className="btn btn-primary w-full btn-md sm:btn-lg">
                  🔗 <span className="hidden sm:inline">東京ガスアカウントで</span>ログイン
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
                    placeholder="パスワードを入力"
                    className="input input-bordered" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <button className="btn btn-primary w-full btn-md sm:btn-lg">
                  ログイン
                </button>
              </>
            )}

            <div className="divider">または</div>

            <div className="space-y-3">

              
              <button type="button" className="btn btn-outline w-full btn-md">
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