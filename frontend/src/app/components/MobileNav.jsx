'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      <div className="navbar bg-white shadow-lg px-4">
        <div className="navbar-start">
          <Link href="/" className="text-lg sm:text-xl font-bold text-blue-800">
            Tech0 by scope3
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="navbar-center hidden lg:flex">
          <div className="tabs tabs-boxed">
            <Link href="/dashboard" className="tab">ダッシュボード</Link>
            <Link href="/points" className="tab">ポイント</Link>
            <Link href="/ranking" className="tab">ランキング</Link>
            <Link href="/upload" className="tab">アップロード</Link>
            <Link href="/ai-analysis" className="tab">AI分析</Link>
          </div>
        </div>

        <div className="navbar-end">
          {/* Mobile hamburger button */}
          <button 
            className="btn btn-ghost lg:hidden"
            onClick={toggleMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* Desktop user menu */}
          <div className="dropdown dropdown-end hidden lg:flex">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-800 font-bold">田</span>
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>プロフィール</a></li>
              <li><a>設定</a></li>
              <li><a>ログアウト</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white shadow-lg border-t">
          <div className="px-4 py-2 space-y-1">
            <Link 
              href="/dashboard" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={closeMenu}
            >
              📊 ダッシュボード
            </Link>
            <Link 
              href="/points" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={closeMenu}
            >
              🏆 ポイント
            </Link>
            <Link 
              href="/ranking" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={closeMenu}
            >
              📈 ランキング
            </Link>
            <Link 
              href="/upload" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={closeMenu}
            >
              📤 アップロード
            </Link>
            <Link 
              href="/ai-analysis" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              onClick={closeMenu}
            >
              🤖 AI分析
            </Link>
            
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-800 font-bold text-sm">田</span>
                </div>
                <span className="text-sm font-medium text-gray-700">田中 太郎</span>
              </div>
              <Link 
                href="/profile" 
                className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={closeMenu}
              >
                プロフィール
              </Link>
              <Link 
                href="/settings" 
                className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={closeMenu}
              >
                設定
              </Link>
              <button 
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                onClick={closeMenu}
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}