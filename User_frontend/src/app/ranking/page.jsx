'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import MobileNav from '../components/MobileNav'

export default function Ranking() {
  const [activeTab, setActiveTab] = useState('individual')
  const [timeframe, setTimeframe] = useState('monthly')
  
  const [individualRanking, setIndividualRanking] = useState([
    { rank: 1, name: '田中 太郎', department: '営業部', reduction: 15.2, points: 1250, avatar: '田' },
    { rank: 2, name: '佐藤 花子', department: 'マーケティング部', reduction: 12.8, points: 1180, avatar: '佐' },
    { rank: 3, name: '鈴木 一郎', department: '開発部', reduction: 11.5, points: 1120, avatar: '鈴' },
    { rank: 4, name: '高橋 美咲', department: '人事部', reduction: 10.3, points: 980, avatar: '高' },
    { rank: 5, name: '渡辺 健太', department: '総務部', reduction: 9.7, points: 890, avatar: '渡' },
    { rank: 6, name: '山田 麻衣', department: '経理部', reduction: 8.9, points: 820, avatar: '山' },
    { rank: 7, name: '中村 大輔', department: '営業部', reduction: 8.2, points: 760, avatar: '中' },
    { rank: 8, name: '小林 由香', department: 'IT部', reduction: 7.8, points: 720, avatar: '小' },
  ])

  const [departmentRanking, setDepartmentRanking] = useState([
    { rank: 1, name: '営業部', members: 25, reduction: 13.4, totalPoints: 12500, color: 'bg-corporate-100 text-corporate' },
    { rank: 2, name: 'マーケティング部', members: 18, reduction: 11.9, totalPoints: 9800, color: 'bg-green-100 text-green-800' },
    { rank: 3, name: '開発部', members: 32, reduction: 10.7, totalPoints: 15600, color: 'bg-purple-100 text-purple-800' },
    { rank: 4, name: '人事部', members: 12, reduction: 9.5, totalPoints: 6200, color: 'bg-yellow-100 text-yellow-800' },
    { rank: 5, name: 'IT部', members: 15, reduction: 8.8, totalPoints: 7800, color: 'bg-red-100 text-red-800' },
    { rank: 6, name: '総務部', members: 20, reduction: 8.1, totalPoints: 8900, color: 'bg-indigo-100 text-indigo-800' },
    { rank: 7, name: '経理部', members: 10, reduction: 7.3, totalPoints: 4500, color: 'bg-pink-100 text-pink-800' },
  ])

  const achievements = [
    { id: 1, title: '月間削減王', description: '月間削減率1位を獲得', icon: 'ion:medal', date: '2025-01', winner: '田中 太郎' },
    { id: 2, title: '部門制覇', description: '営業部が部門ランキング1位', icon: 'ion:trophy', date: '2025-01', winner: '営業部' },
    { id: 3, title: '新記録達成', description: '個人削減率15%を突破', icon: 'ion:flag', date: '2025-01', winner: '田中 太郎' },
    { id: 4, title: 'エコチャンピオン', description: '3ヶ月連続削減率10%以上', icon: 'ion:star', date: '2024-12', winner: '佐藤 花子' },
  ]

  const getRankBadge = (rank) => {
    if (rank === 1) return 'badge-warning'
    if (rank === 2) return 'badge-neutral'
    if (rank === 3) return 'badge-accent'
    return 'badge-ghost'
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Icon icon="ion:trophy" className="text-4xl text-yellow-500" />
    if (rank === 2) return <Icon icon="ion:trophy" className="text-4xl text-gray-400" />
    if (rank === 3) return <Icon icon="ion:trophy" className="text-4xl text-orange-400" />
    return `${rank}位`
  }

  return (
    <div className="min-h-screen bg-custom">
      <MobileNav />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">企業内削減率ランキング</h1>
          <div className="flex gap-4">
            <select 
              className="select select-bordered"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="monthly">今月</option>
              <option value="quarterly">四半期</option>
              <option value="yearly">年間</option>
            </select>
          </div>
        </div>

        <div className="tabs tabs-lifted mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap">
          <button 
            className={`tab tab-sm sm:tab-lg flex-shrink-0 ${activeTab === 'individual' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('individual')}
          >
            <Icon icon="carbon:user" className="inline mr-1 sm:mr-2" /> 
            <span className="hidden sm:inline">個人ランキング</span>
            <span className="sm:hidden">個人</span>
          </button>
          <button 
            className={`tab tab-sm sm:tab-lg flex-shrink-0 ${activeTab === 'department' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('department')}
          >
            <Icon icon="carbon:building" className="inline mr-1 sm:mr-2" /> 
            <span className="hidden sm:inline">部門ランキング</span>
            <span className="sm:hidden">部門</span>
          </button>
          <button 
            className={`tab tab-sm sm:tab-lg flex-shrink-0 ${activeTab === 'achievements' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <Icon icon="ion:trophy" className="inline mr-1 sm:mr-2" /> 
            <span className="hidden sm:inline">実績表彰</span>
            <span className="sm:hidden">実績</span>
          </button>
        </div>

        {activeTab === 'individual' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              <div className="card bg-white shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-6"><Icon icon="carbon:user" className="inline mr-2" /> 個人削減率ランキング</h2>
                  
                  {individualRanking.slice(0, 3).map((person, index) => (
                    <div key={person.rank} className={`p-4 rounded-lg mb-4 ${
                      index === 0 ? 'bg-yellow-100' :
                      index === 1 ? 'bg-gray-100' :
                      'bg-orange-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>{getRankIcon(person.rank)}</div>
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-full bg-corporate-100 flex items-center justify-center">
                              <span className="text-corporate font-bold text-lg">{person.avatar}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-lg">{person.name}</div>
                            <div className="text-sm text-gray-600">{person.department}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{person.reduction}%</div>
                          <div className="text-sm text-gray-600">{person.points}pt</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="divider">その他の順位</div>

                  <div className="space-y-2">
                    {individualRanking.slice(3).map((person) => (
                      <div key={person.rank} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`badge ${getRankBadge(person.rank)} badge-lg`}>
                            {person.rank}位
                          </div>
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-corporate-100 flex items-center justify-center">
                              <span className="text-corporate font-bold">{person.avatar}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{person.name}</div>
                            <div className="text-sm text-gray-600">{person.department}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{person.reduction}%</div>
                          <div className="text-sm text-gray-600">{person.points}pt</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card bg-corporate text-white shadow-xl">
                <div className="card-body text-center">
                  <Icon icon="ion:trophy" className="text-4xl mb-2" />
                  <h3 className="card-title justify-center text-white">あなたの順位</h3>
                  <div className="text-3xl font-bold">1位</div>
                  <div className="text-lg opacity-90">削減率: 15.2%</div>
                  <div className="text-sm opacity-80">1,250ポイント獲得</div>
                </div>
              </div>

              <div className="card bg-white shadow-xl">
                <div className="card-body">
                  <h3 className="card-title"><Icon icon="ion:stats-chart" className="inline mr-2" /> 部門別統計</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>営業部平均</span>
                      <span className="font-bold">13.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>全社平均</span>
                      <span className="font-bold">10.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>目標削減率</span>
                      <span className="font-bold text-corporate">12.0%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-white shadow-xl">
                <div className="card-body">
                  <h3 className="card-title"><Icon icon="ion:flag" className="inline mr-2" /> 今月の目標</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>1位維持</span>
                        <span>達成済み ✅</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>15%削減達成</span>
                        <span>達成済み ✅</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>1,500pt獲得</span>
                        <span>83%</span>
                      </div>
                      <progress className="progress progress-primary w-full" value="83" max="100"></progress>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'department' && (
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6"><Icon icon="carbon:building" className="inline mr-2" /> 部門別削減率ランキング</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentRanking.map((dept, index) => (
                  <div key={dept.rank} className={`card shadow-lg ${
                    index < 3 ? 'ring-2 ring-yellow-300' : ''
                  }`}>
                    <div className="card-body">
                      <div className="flex items-center justify-between mb-3">
                        <div>{getRankIcon(dept.rank)}</div>
                        <div className={`badge badge-lg ${dept.color}`}>
                          {dept.members}名
                        </div>
                      </div>
                      
                      <h3 className="card-title text-lg">{dept.name}</h3>
                      
                      <div className="stats stats-vertical shadow-sm bg-gray-50">
                        <div className="stat py-2">
                          <div className="stat-title text-xs">削減率</div>
                          <div className="stat-value text-2xl text-green-600">{dept.reduction}%</div>
                        </div>
                        <div className="stat py-2">
                          <div className="stat-title text-xs">総ポイント</div>
                          <div className="stat-value text-lg text-corporate">{dept.totalPoints.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6"><Icon icon="ion:trophy" className="inline mr-2" /> 最新の実績表彰</h2>
                
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-4 p-4 bg-corporate-100 rounded-lg">
                      <Icon icon={achievement.icon} className="text-4xl text-corporate" />
                      <div className="flex-1">
                        <div className="font-bold text-lg">{achievement.title}</div>
                        <div className="text-sm text-gray-600">{achievement.description}</div>
                        <div className="text-sm text-corporate font-medium">受賞者: {achievement.winner}</div>
                      </div>
                      <div className="text-right">
                        <div className="badge badge-primary">{achievement.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card bg-white shadow-xl">
                <div className="card-body">
                  <h3 className="card-title"><Icon icon="ion:trending-up" className="inline mr-2" /> 月次成長率</h3>
                  <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">成長率グラフ（Chart.js等で実装予定）</p>
                  </div>
                </div>
              </div>

              <div className="card bg-white shadow-xl">
                <div className="card-body">
                  <h3 className="card-title"><Icon icon="ion:medal" className="inline mr-2" /> 獲得バッジ</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Icon icon="ion:trophy" className="text-3xl mb-1 text-yellow-500" />
                      <div className="text-xs font-bold">月間王者</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Icon icon="carbon:tree" className="text-3xl mb-1 text-green-500" />
                      <div className="text-xs font-bold">エコ達人</div>
                    </div>
                    <div className="text-center p-3 bg-corporate-50 rounded-lg">
                      <Icon icon="ion:trending-up" className="text-3xl mb-1 text-corporate" />
                      <div className="text-xs font-bold">成長王</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Icon icon="ion:flag" className="text-3xl mb-1 text-purple-500" />
                      <div className="text-xs font-bold">目標達成</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <Icon icon="carbon:fire" className="text-3xl mb-1 text-red-500" />
                      <div className="text-xs font-bold">継続王</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg opacity-50">
                      <Icon icon="ion:help-circle" className="text-3xl mb-1 text-gray-400" />
                      <div className="text-xs">未獲得</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}