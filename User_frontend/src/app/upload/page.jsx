'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import MobileNav from '../components/MobileNav'
import { Icon } from '@iconify/react'

export default function Upload() {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [uploadHistory, setUploadHistory] = useState([
    { id: 1, filename: 'gas_bill_202412.pdf', uploadDate: '2025-01-10', status: '処理完了', points: 30 },
    { id: 2, filename: 'electricity_bill_202412.pdf', uploadDate: '2025-01-09', status: '処理完了', points: 25 },
    { id: 3, filename: 'water_bill_202412.pdf', uploadDate: '2025-01-08', status: '処理完了', points: 20 },
    { id: 4, filename: 'gas_bill_202411.pdf', uploadDate: '2024-12-10', status: '処理完了', points: 30 },
  ])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB
    })

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles.map(file => ({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        status: 'pending'
      }))])
    }
  }

  const processFiles = async () => {
    setProcessing(true)
    
    for (let uploadedFile of uploadedFiles) {
      if (uploadedFile.status === 'pending') {
        // ファイル処理のシミュレーション
        uploadedFile.status = 'processing'
        setUploadedFiles([...uploadedFiles])
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // OCR処理と分析のシミュレーション
        const points = Math.floor(Math.random() * 30) + 10
        uploadedFile.status = 'completed'
        uploadedFile.points = points
        
        // 履歴に追加
        setUploadHistory(prev => [{
          id: Date.now(),
          filename: uploadedFile.name,
          uploadDate: new Date().toLocaleDateString('ja-JP'),
          status: '処理完了',
          points: points
        }, ...prev])
      }
    }
    
    setProcessing(false)
    // アップロード完了後、ファイルリストをクリア
    setTimeout(() => setUploadedFiles([]), 1000)
  }

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-custom pt-16">
      <MobileNav />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">利用明細書アップロード</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-6">
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">
                  <Icon icon="carbon:upload" className="text-2xl mr-2" />
                  ファイルアップロード
                </h2>
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-corporate bg-corporate-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-6xl mb-4">
                    <Icon icon="carbon:document" className="text-6xl text-corporate" />
                  </div>
                  <div className="text-xl font-bold mb-2">ファイルをドロップするか、クリックして選択</div>
                  <div className="text-gray-600 mb-4">
                    対応形式: PDF, JPG, PNG (最大10MB)
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                    className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                  />
                </div>

                <div className="alert border-2 border-corporate bg-transparent mt-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6 text-corporate">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <p className="font-bold text-corporate">アップロード可能な明細書</p>
                    <p className="text-sm text-gray-700">ガス・電気・水道の利用明細書をアップロードできます。OCR技術により自動で使用量を読み取り、Tech0ポイントを獲得できます。</p>
                  </div>
                </div>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="card bg-white shadow-xl">
                <div className="card-body">
                  <h3 className="card-title">アップロード待ちファイル</h3>
                  <div className="space-y-3">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {file.status === 'completed' ? <Icon icon="carbon:checkmark-filled" className="text-green-600" /> : 
                             file.status === 'processing' ? <Icon icon="carbon:in-progress" className="text-yellow-600" /> : <Icon icon="carbon:document" className="text-corporate" />}
                          </div>
                          <div>
                            <div className="font-medium truncate max-w-xs">{file.name}</div>
                            <div className="text-sm text-gray-600">{formatFileSize(file.size)}</div>
                            {file.points && (
                              <div className="text-sm text-green-600 font-bold">+{file.points} points</div>
                            )}
                          </div>
                        </div>
                        {file.status === 'pending' && (
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => removeFile(file.id)}
                          >
                            <Icon icon="carbon:close" className="text-red-600" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className={`btn btn-primary ${processing ? 'loading' : ''}`}
                      onClick={processFiles}
                      disabled={processing || uploadedFiles.every(f => f.status !== 'pending')}
                    >
                      {processing ? '処理中...' : 'アップロード開始'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title">
                  <Icon icon="ion:stats-chart" className="text-lg mr-2" />
                  アップロード統計
                </h3>
                <div className="stats stats-vertical shadow">
                  <div className="stat">
                    <div className="stat-title">今月のアップロード</div>
                    <div className="stat-value">3</div>
                    <div className="stat-desc">ファイル</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-title">獲得ポイント</div>
                    <div className="stat-value text-green-600">75</div>
                    <div className="stat-desc">今月合計</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-title">処理精度</div>
                    <div className="stat-value text-corporate">98%</div>
                    <div className="stat-desc">OCR読み取り精度</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">
                  <Icon icon="carbon:light-bulb" className="text-lg mr-2" />
                  アップロードのコツ
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Icon icon="carbon:camera" className="text-2xl text-corporate" />
                    <div>
                      <div className="font-bold">鮮明な画像で撮影</div>
                      <div className="text-sm text-gray-600">数値部分がはっきり見えるように撮影してください</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Icon icon="carbon:document-pdf" className="text-2xl text-red-600" />
                    <div>
                      <div className="font-bold">PDFファイルを優先</div>
                      <div className="text-sm text-gray-600">PDF形式の方が読み取り精度が高くなります</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Icon icon="ion:trophy" className="text-2xl text-yellow-600" />
                    <div>
                      <div className="font-bold">ポイント獲得</div>
                      <div className="text-sm text-gray-600">正常に処理されると10-30ポイント獲得できます</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-white shadow-xl mt-6 sm:mt-8">
          <div className="card-body">
            <h3 className="card-title text-2xl mb-6">
              <Icon icon="carbon:list" className="text-2xl mr-2" />
              アップロード履歴
            </h3>
            
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ファイル名</th>
                    <th>アップロード日</th>
                    <th>ステータス</th>
                    <th>獲得ポイント</th>
                    <th>アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadHistory.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Icon icon="carbon:document" className="text-xl text-corporate" />
                          <div className="font-medium">{item.filename}</div>
                        </div>
                      </td>
                      <td>{item.uploadDate}</td>
                      <td>
                        <div className="badge badge-success">{item.status}</div>
                      </td>
                      <td>
                        <div className="font-bold text-green-600">+{item.points}pt</div>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm">詳細</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}