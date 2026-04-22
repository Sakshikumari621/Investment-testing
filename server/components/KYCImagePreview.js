const React = require('react');

const KYCImagePreview = (props) => {
  const { record, property } = props;
  const value = record.params[property.name];

  if (!value) return React.createElement('span', null, 'No image uploaded');

  // Extract filename from path (e.g. "uploads\file.jpg" or "uploads/file.jpg")
  const filename = value.includes('\\') ? value.split('\\').pop() : value.split('/').pop();
  const imageUrl = `/api/auth/documents/${filename}`;

  return React.createElement('div', { style: { marginBottom: '20px' } }, [
    React.createElement('a', { 
      href: imageUrl, 
      target: '_blank', 
      rel: 'noopener noreferrer',
      key: 'link'
    }, [
      React.createElement('img', {
        src: imageUrl,
        alt: property.label,
        style: { maxWidth: '400px', maxHeight: '400px', border: '1px solid #ddd', borderRadius: '8px', display: 'block' },
        key: 'image'
      })
    ]),
    React.createElement('p', {
      style: { fontSize: '12px', marginTop: '8px', color: '#8991a1' },
      key: 'text'
    }, 'Secure preview. Click to open full size.')
  ]);
};

module.exports = KYCImagePreview;
