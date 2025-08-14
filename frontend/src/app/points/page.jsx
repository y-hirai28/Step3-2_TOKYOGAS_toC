'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MobileNav from '../components/MobileNav'

export default function Points() {
  const [currentPoints, setCurrentPoints] = useState(1250)
  const [pointHistory, setPointHistory] = useState([
    { id: 1, date: '2025-01-12', action: 'エアコン温度設定最適化', points: 50, type: 'earn' },
    { id: 2, date: '2025-01-11', action: '照明LED化完了', points: 100, type: 'earn' },
    { id: 3, date: '2025-01-10', action: 'コーヒーメーカー交換', points: 30, type: 'redeem' },
    { id: 4, date: '2025-01-09', action: '省エネ研修受講', points: 80, type: 'earn' },
    { id: 5, date: '2025-01-08', action: 'ガス使用量10%削減達成', points: 120, type: 'earn' },
    { id: 6, date: '2025-01-07', action: '社内カフェクーポン', points: 200, type: 'redeem' },
    { id: 7, date: '2025-01-06', action: '待機電力削減', points: 40, type: 'earn' },
    { id: 8, date: '2025-01-05', action: '週次削減目標達成', points: 60, type: 'earn' },
  ])

  const [rewards, setRewards] = useState([
    { id: 1, name: '社内カフェクーポン', points: 200, category: 'カフェ', image: '☕' },
    { id: 2, name: 'エコバッグ', points: 300, category: 'グッズ', image: '🛍️' },
    { id: 3, name: '植物（観葉植物）', points: 500, category: 'グッズ', image: '🪴' },
    { id: 4, name: '図書カード 1,000円', points: 800, category: 'ギフト券', image: '📚' },
    { id: 5, name: '特別休暇 0.5日', points: 1000, category: '休暇', image: '🏖️' },
    { id: 6, name: 'Amazonギフト券 3,000円', points: 1500, category: 'ギフト券', image: '🎁' },
  ])

  const [selectedCategory, setSelectedCategory] = useState('all')
  const categories = ['all', 'カフェ', 'グッズ', 'ギフト券', '休暇']

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory)

  const totalEarned = pointHistory.filter(h => h.type === 'earn').reduce((sum, h) => sum + h.points, 0)
  const totalRedeemed = pointHistory.filter(h => h.type === 'redeem').reduce((sum, h) => sum + h.points, 0)

  const handleRedeem = (rewardId, requiredPoints) => {
    if (currentPoints >= requiredPoints) {
      setCurrentPoints(currentPoints - requiredPoints)
      const reward = rewards.find(r => r.id === rewardId)
      setPointHistory([
        { 
          id: Date.now(), 
          date: new Date().toLocaleDateString('ja-JP'), 
          action: reward.name, 
          points: requiredPoints, 
          type: 'redeem' 
        },
        ...pointHistory
      ])
      alert(`${reward.name}と交換しました！`)
    } else {
      alert('ポイントが不足しています。')
    }
  }

  return (
    <div className="min-h-screen bg-custom">
      <MobileNav />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Tech0ポイントシステム</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="card bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-xl">
            <div className="card-body text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="card-title justify-center text-white text-2xl">現在のポイント</h2>
              <div className="text-4xl font-bold mb-2">{currentPoints.toLocaleString()}</div>
              <p className="opacity-90">Tech0 Points</p>
            </div>
          </div>

          <div className="card bg-white shadow-xl">
            <div className="card-body text-center">
              <div className="text-4xl mb-4 text-green-600">📈</div>
              <h2 className="card-title justify-center">獲得ポイント</h2>
              <div className="text-3xl font-bold text-green-600">{totalEarned.toLocaleString()}</div>
              <p className="text-gray-600">累計獲得</p>
            </div>
          </div>

          <div className="card bg-white shadow-xl">
            <div className="card-body text-center">
              <div className="text-4xl mb-4 text-orange-600">🎁</div>
              <h2 className="card-title justify-center">使用ポイント</h2>
              <div className="text-3xl font-bold text-orange-600">{totalRedeemed.toLocaleString()}</div>
              <p className="text-gray-600">累計使用</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">🎁 ポイント交換</h2>
              
              <div className="tabs tabs-boxed mb-6">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`tab ${selectedCategory === category ? 'tab-active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? '全て' : category}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredRewards.map(reward => (
                  <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{reward.image}</div>
                      <div>
                        <div className="font-bold">{reward.name}</div>
                        <div className="text-sm text-gray-600">{reward.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{reward.points}pt</div>
                      <button 
                        className={`btn btn-sm ${currentPoints >= reward.points ? 'btn-primary' : 'btn-disabled'}`}
                        onClick={() => handleRedeem(reward.id, reward.points)}
                        disabled={currentPoints < reward.points}
                      >
                        交換
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">📊 ポイント履歴</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pointHistory.map(history => (
                  <div key={history.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${history.type === 'earn' ? 'text-green-600' : 'text-orange-600'}`}>
                        {history.type === 'earn' ? '📈' : '🎁'}
                      </div>
                      <div>
                        <div className="font-medium">{history.action}</div>
                        <div className="text-sm text-gray-600">{history.date}</div>
                      </div>
                    </div>
                    <div className={`font-bold text-lg ${history.type === 'earn' ? 'text-green-600' : 'text-orange-600'}`}>
                      {history.type === 'earn' ? '+' : '-'}{history.points}pt
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-white shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">💡 ポイント獲得方法</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-4xl mb-3">🌡️</div>
                <h3 className="font-bold mb-2">温度設定最適化</h3>
                <p className="text-sm text-gray-600">エアコンの温度を適切に設定</p>
                <div className="badge badge-success mt-2">10-50pt</div>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-4xl mb-3">💡</div>
                <h3 className="font-bold mb-2">LED化推進</h3>
                <p className="text-sm text-gray-600">照明のLED化を実施</p>
                <div className="badge badge-warning mt-2">50-100pt</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-bold mb-2">研修受講</h3>
                <p className="text-sm text-gray-600">省エネ研修を受講</p>
                <div className="badge badge-info mt-2">50-100pt</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold mb-2">目標達成</h3>
                <p className="text-sm text-gray-600">月次削減目標を達成</p>
                <div className="badge badge-secondary mt-2">100-200pt</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="font-bold mb-2">待機電力削減</h3>
                <p className="text-sm text-gray-600">機器の待機電力を削減</p>
                <div className="badge badge-error mt-2">20-40pt</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold mb-2">データアップロード</h3>
                <p className="text-sm text-gray-600">利用明細をアップロード</p>
                <div className="badge badge-accent mt-2">10-30pt</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}