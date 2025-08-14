'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MobileNav from '../components/MobileNav'

export default function AIAnalysis() {
  const [analysisData, setAnalysisData] = useState({
    overall: {
      score: 85,
      trend: 'improving',
      summary: 'あなたのエネルギー使用パターンは優秀です。継続的な改善が見られています。'
    },
    recommendations: [
      {
        id: 1,
        category: 'ガス',
        title: '暖房設定温度の最適化',
        description: 'エアコンの設定温度を1度下げることで、月間約8%のガス使用量削減が期待できます。',
        impact: 'high',
        points: 50,
        difficulty: 'easy',
        icon: '🌡️'
      },
      {
        id: 2,
        category: '電力',
        title: 'LED照明への完全移行',
        description: '残りの蛍光灯をLEDに交換することで、照明コストを40%削減できます。',
        impact: 'high',
        points: 100,
        difficulty: 'medium',
        icon: '💡'
      },
      {
        id: 3,
        category: '電力',
        title: '待機電力の削減',
        description: 'OA機器の待機電力を削減することで、月間約3%の電力削減が可能です。',
        impact: 'medium',
        points: 30,
        difficulty: 'easy',
        icon: '⚡'
      },
      {
        id: 4,
        category: '水道',
        title: '節水器具の導入',
        description: '節水シャワーヘッドの導入で水道使用量を15%削減できます。',
        impact: 'medium',
        points: 40,
        difficulty: 'easy',
        icon: '💧'
      }
    ],
    patterns: {
      peak_usage: '14:00-16:00',
      low_usage: '22:00-06:00',
      weekly_pattern: 'weekdays_high',
      seasonal_trend: 'winter_peak'
    },
    predictions: {
      next_month_reduction: 12.5,
      annual_savings: 45600,
      co2_reduction: 280
    }
  })

  const [selectedRecommendation, setSelectedRecommendation] = useState(null)
  const [aiComments, setAiComments] = useState([
    {
      id: 1,
      date: '2025-01-13',
      category: '全体分析',
      comment: '今月は前月比で全体的に8.5%の使用量削減を達成されています。特にガス使用量の削減が顕著で、暖房設定の工夫が効果的でした。',
      sentiment: 'positive',
      actionable: true
    },
    {
      id: 2,
      date: '2025-01-12',
      category: '使用パターン',
      comment: '平日14-16時に電力使用量のピークが見られます。この時間帯の機器使用を見直すことで、さらなる削減が期待できます。',
      sentiment: 'neutral',
      actionable: true
    },
    {
      id: 3,
      date: '2025-01-11',
      category: '比較分析',
      comment: '同規模企業と比較して、あなたの削減率は上位20%に位置しています。継続的な取り組みが実を結んでいます。',
      sentiment: 'positive',
      actionable: false
    },
    {
      id: 4,
      date: '2025-01-10',
      category: '予測分析',
      comment: '現在のペースを維持すれば、年間目標の15%削減を3月までに達成できる見込みです。',
      sentiment: 'positive',
      actionable: false
    }
  ])

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'badge-success'
      case 'medium': return 'badge-warning'
      case 'hard': return 'badge-error'
      default: return 'badge-neutral'
    }
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '😊'
      case 'neutral': return '😐'
      case 'negative': return '😟'
      default: return '🤖'
    }
  }

  const implementRecommendation = (recommendation) => {
    alert(`「${recommendation.title}」を実行リストに追加しました！実行後は${recommendation.points}ポイントを獲得できます。`)
  }

  return (
    <div className="min-h-screen bg-custom">
      <MobileNav />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">🤖 AI分析・コメント</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="card bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-xl">
            <div className="card-body text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="card-title justify-center text-white text-xl">総合スコア</h2>
              <div className="text-4xl font-bold">{analysisData.overall.score}</div>
              <p className="opacity-90">エネルギー効率</p>
            </div>
          </div>

          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">📈 予測削減率</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analysisData.predictions.next_month_reduction}%
              </div>
              <p className="text-sm text-gray-600">来月予測</p>
              <div className="mt-3">
                <div className="text-sm text-gray-600">年間削減見込み</div>
                <div className="font-bold">{analysisData.predictions.co2_reduction}kg CO2</div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">💰 予測節約額</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ¥{analysisData.predictions.annual_savings.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">年間節約予測</p>
              <div className="mt-3">
                <div className="text-sm text-gray-600">月平均</div>
                <div className="font-bold">¥{Math.round(analysisData.predictions.annual_savings / 12).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">💡 AI改善提案</h2>
              
              <div className="space-y-4">
                {analysisData.recommendations.map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{rec.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg">{rec.title}</h3>
                          <div className="badge badge-outline">{rec.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`badge ${getImpactColor(rec.impact)} badge-lg`}>
                          {rec.impact === 'high' ? '高効果' : rec.impact === 'medium' ? '中効果' : '低効果'}
                        </div>
                        <div className="text-sm text-green-600 font-bold mt-1">+{rec.points}pt</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{rec.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className={`badge ${getDifficultyColor(rec.difficulty)}`}>
                        {rec.difficulty === 'easy' ? '簡単' : rec.difficulty === 'medium' ? '普通' : '困難'}
                      </div>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => implementRecommendation(rec)}
                      >
                        実行する
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">📊 使用パターン分析</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">ピーク使用時間</span>
                    <span className="badge badge-warning">{analysisData.patterns.peak_usage}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">低使用時間</span>
                    <span className="badge badge-success">{analysisData.patterns.low_usage}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">週間パターン</span>
                    <span className="badge badge-info">平日多め</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">季節傾向</span>
                    <span className="badge badge-secondary">冬季ピーク</span>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800 mb-2">使用効率</div>
                  <div className="radial-progress text-primary" style={{"--value": analysisData.overall.score}} role="progressbar">
                    {analysisData.overall.score}%
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">🎯 改善目標</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>月間削減率</span>
                      <span>12.5% / 15%</span>
                    </div>
                    <progress className="progress progress-success w-full" value="83" max="100"></progress>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>年間CO2削減</span>
                      <span>280kg / 400kg</span>
                    </div>
                    <progress className="progress progress-info w-full" value="70" max="100"></progress>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>節約額目標</span>
                      <span>¥45,600 / ¥60,000</span>
                    </div>
                    <progress className="progress progress-warning w-full" value="76" max="100"></progress>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-white shadow-xl mt-6 sm:mt-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">💬 AIコメント履歴</h2>
            
            <div className="space-y-4">
              {aiComments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getSentimentIcon(comment.sentiment)}</span>
                      <div>
                        <div className="font-bold">{comment.category}</div>
                        <div className="text-sm text-gray-600">{comment.date}</div>
                      </div>
                    </div>
                    {comment.actionable && (
                      <div className="badge badge-accent">実行可能</div>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <button className="btn btn-outline btn-primary">
                過去のコメントをもっと見る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}