import { useState } from 'react'
import { useLoads } from '../hooks/useLoads.js'
import { useUploadDocument } from '../hooks/useDocument.js'

const Documents = () => {
  const { data } = useLoads()
  const { mutate: uploadDocument, isPending, isSuccess, data: uploadResult } = useUploadDocument()
  const [selectedLoad, setSelectedLoad] = useState('')
  const [documentType, setDocumentType] = useState('BOL')
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const loads = data?.loads || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !selectedLoad) return

    const formData = new FormData()
    formData.append('document', file)
    formData.append('loadId', selectedLoad)
    formData.append('documentType', documentType)

    uploadDocument(formData)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) setFile(droppedFile)
  }

  const extractedData = uploadResult?.extractedData

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-base font-medium text-gray-900">Documents</h2>
        <p className="text-sm text-gray-400">Upload and AI-extract freight documents</p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-400 uppercase mb-4">Upload document</div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Select load</label>
                <select
                  value={selectedLoad}
                  onChange={e => setSelectedLoad(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                  required
                >
                  <option value="">Choose a load...</option>
                  {loads.map(load => (
                    <option key={load._id} value={load._id}>
                      {load.loadNumber} — {load.pickup?.city} → {load.delivery?.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Document type</label>
                <select
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-400"
                >
                  <option value="BOL">Bill of Lading (BOL)</option>
                  <option value="POD">Proof of Delivery (POD)</option>
                  <option value="RATE_CON">Rate Confirmation</option>
                </select>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => setFile(e.target.files[0])}
                />
                {file ? (
                  <div>
                    <div className="text-sm font-medium text-gray-900">{file.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl mb-2">📄</div>
                    <div className="text-sm text-gray-500">Drop file here or click to upload</div>
                    <div className="text-xs text-gray-400 mt-1">JPG, PNG, PDF supported</div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending || !file || !selectedLoad}
                className="w-full bg-emerald-600 text-white text-sm py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                {isPending ? 'Processing with AI...' : 'Upload & Extract'}
              </button>
            </form>
          </div>
        </div>

        <div>
          {isPending && (
            <div className="bg-white border border-gray-100 rounded-lg p-6 text-center">
              <div className="text-2xl mb-3">🤖</div>
              <div className="text-sm font-medium text-gray-900">AI is reading your document...</div>
              <div className="text-xs text-gray-400 mt-1">Extracting freight data automatically</div>
              <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {isSuccess && extractedData && (
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-medium text-gray-400 uppercase">Extracted data</div>
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">
                  AI extracted
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(extractedData).map(([key, value]) => (
                  value !== null && (
                    <div key={key} className="flex items-start justify-between py-2 border-b border-gray-50">
                      <span className="text-xs text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-xs font-medium text-gray-900 text-right max-w-48">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                      </span>
                    </div>
                  )
                ))}
              </div>

              {uploadResult?.s3Url && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400 mb-1">Stored in AWS S3</div>
                  
                <a    href={uploadResult.s3Url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-600 hover:underline break-all"
                  >
                    View document ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {!isPending && !isSuccess && (
            <div className="bg-white border border-gray-100 rounded-lg p-8 text-center">
              <div className="text-3xl mb-3">🤖</div>
              <div className="text-sm font-medium text-gray-900">AI Document Extraction</div>
              <div className="text-xs text-gray-400 mt-2 leading-5">
                Upload a Bill of Lading or shipping document. Our AI will automatically extract shipper, consignee, commodity, weight, and more.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Documents