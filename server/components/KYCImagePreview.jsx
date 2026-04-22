import React from 'react'

const KYCImagePreview = (props) => {
  const { record, property } = props
  const value = record.params[property.name]

  if (!value) return <span>No image uploaded</span>

  // Extract filename from path (e.g. "uploads\file.jpg" or "uploads/file.jpg")
  const filename = value.includes('\\') ? value.split('\\').pop() : value.split('/').pop()
  const imageUrl = `/api/auth/documents/${filename}`

  return (
    <div style={{ marginBottom: '20px' }}>
      <a href={imageUrl} target="_blank" rel="noopener noreferrer">
        <img 
          src={imageUrl} 
          alt={property.label} 
          style={{ maxWidth: '400px', maxHeight: '400px', border: '1px solid #ddd', borderRadius: '8px', display: 'block' }} 
        />
      </a>
      <p style={{ fontSize: '12px', marginTop: '8px', color: '#8991a1' }}>
        Secure preview. Click to open full size.
      </p>
    </div>
  )
}

export default KYCImagePreview
