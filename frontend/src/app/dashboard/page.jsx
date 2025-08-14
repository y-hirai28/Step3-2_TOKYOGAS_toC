'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MobileNav from '../components/MobileNav'
import { energyAPI, pointsAPI } from '../../lib/api'

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [usageData, setUsageData] = useState({
    gas: { amount: 245, cost: 12450, unit: 'm³' },
    electricity: { amount: 432, cost: 15680, unit: 'kWh' }
  })
  const [points, setPoints] = useState(1250)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load energy data from API
  const loadEnergyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to fetch real data from API
      const monthlyData = await energyAPI.getMonthlyUsage(currentYear, currentMonth + 1)
      const pointsData = await pointsAPI.getBalance()
      
      setUsageData(monthlyData.usage || usageData)
      setPoints(pointsData.balance || points)
    } catch (error) {
      console.warn('API not available, using mock data:', error)
      setError('APIに接続できません。サンプルデータを表示しています。')
      // Keep existing mock data
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount and when month/year changes
  useEffect(() => {
    loadEnergyData()
  }, [currentMonth, currentYear])

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  const changeMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const totalCost = usageData.gas.cost + usageData.electricity.cost

  return (
    <div className="min-h-screen bg-custom">
      <MobileNav />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">エネルギー利用状況</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              className="btn btn-circle btn-outline btn-sm sm:btn-md"
              onClick={() => changeMonth('prev')}
            >
              ❮
            </button>
            <div className="text-lg sm:text-xl font-bold text-center min-w-[100px] sm:min-w-[120px]">
              {currentYear}年{monthNames[currentMonth]}
            </div>
            <button 
              className="btn btn-circle btn-outline btn-sm sm:btn-md"
              onClick={() => changeMonth('next')}
            >
              ❯
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <div className="card bg-white shadow-xl">
              <div className="card-body p-4 sm:p-6">
                <h2 className="card-title text-xl sm:text-2xl mb-4 sm:mb-6">月次利用料金・利用量</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="stat bg-blue-50 rounded-lg">
                    <div className="stat-figure text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <div className="stat-title">ガス使用量</div>
                    <div className="stat-value text-blue-600">{usageData.gas.amount}</div>
                    <div className="stat-desc">{usageData.gas.unit}</div>
                    <div className="stat-desc text-lg font-bold mt-2">¥{usageData.gas.cost.toLocaleString()}</div>
                  </div>

                  <div className="stat bg-yellow-50 rounded-lg">
                    <div className="stat-figure text-yellow-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <div className="stat-title">電力使用量</div>
                    <div className="stat-value text-yellow-600">{usageData.electricity.amount}</div>
                    <div className="stat-desc">{usageData.electricity.unit}</div>
                    <div className="stat-desc text-lg font-bold mt-2">¥{usageData.electricity.cost.toLocaleString()}</div>
                  </div>


                </div>

                <div className="divider my-6"></div>

                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-gray-800">
                    合計: ¥{totalCost.toLocaleString()}
                  </div>
                  <div className="badge badge-success badge-lg">
                    前月比 -8.5%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="card bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-xl">
              <div className="card-body text-center p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl mb-2">🏆</div>
                <h2 className="card-title justify-center text-white text-lg sm:text-xl">Tech0ポイント</h2>
                <div className="text-2xl sm:text-3xl font-bold">{points.toLocaleString()}</div>
                <p className="opacity-90 text-sm sm:text-base">今月獲得: +180pt</p>
                <Link href="/points" className="btn btn-white btn-outline btn-sm sm:btn-md mt-3 sm:mt-4 w-full sm:w-auto">
                  詳細を見る
                </Link>
              </div>
            </div>

            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">🤖 AI分析コメント</h3>
                <div className="space-y-3 text-sm">
                  <p className="bg-blue-50 p-3 rounded-lg">
                    「今月のガス使用量は前月比で8.5%削減されています。暖房設定温度の適正化が効果的でした。」
                  </p>
                  <p className="bg-green-50 p-3 rounded-lg">
                    「電力使用量も順調に削減中。照明のLED化による効果が現れています。」
                  </p>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary btn-sm">詳細分析</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card bg-white shadow-xl">
            <div className="card-body p-4 sm:p-6">
              <h3 className="card-title text-lg sm:text-xl">📊 使用量推移グラフ</h3>
              <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm sm:text-base text-center">グラフコンポーネント<br className="sm:hidden" />（Chart.js等で実装予定）</p>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-xl">
            <div className="card-body p-4 sm:p-6">
              <h3 className="card-title text-lg sm:text-xl">🎯 今月の削減目標</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ガス使用量削減</span>
                    <span>85%</span>
                  </div>
                  <progress className="progress progress-success w-full" value="85" max="100"></progress>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>電力使用量削減</span>
                    <span>92%</span>
                  </div>
                  <progress className="progress progress-success w-full" value="92" max="100"></progress>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>水道使用量削減</span>
                    <span>78%</span>
                  </div>
                  <progress className="progress progress-warning w-full" value="78" max="100"></progress>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}