import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CreatePost() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ movieTitle: '', description: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return setError('Please upload an image file (JPG, PNG, WebP)');
    }
    if (file.size > 10 * 1024 * 1024) {
      return setError('Image must be under 10MB');
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleFileChange = (e) => handleImage(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImage(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setError('Please upload a movie screenshot');
    if (!form.movieTitle.trim()) return setError('Movie title is required');
    if (!form.description.trim()) return setError('Write a review or description');

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', image);
    formData.append('movieTitle', form.movieTitle.trim());
    formData.append('description', form.description.trim());

    try {
      // Do NOT set Content-Type manually — axios + browser must set it
      // automatically so the multipart boundary is included, e.g.:
      //   multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
      // Overriding it strips the boundary and multer can't parse the body.
      const { data } = await api.post('/posts', formData);
      navigate(`/post/${data.post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)] mb-2">
          Share with the community
        </p>
        <h1 className="font-display text-4xl font-bold text-gradient-red">
          New Post
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="border border-blood-800/60 bg-blood-950/40 px-4 py-3 text-sm text-blood-300 animate-fade-in">
            <span className="text-blood-600 mr-2">✦</span> {error}
          </div>
        )}

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
            Movie Screenshot *
          </label>

          {preview ? (
            <div className="relative group">
              <img src={preview} alt="Preview" className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" onClick={() => { setImage(null); setPreview(''); }}
                  className="btn-ghost text-xs">
                  Change Image
                </button>
              </div>
              {/* Cinematic frame corners */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-blood-700" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-blood-700" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-blood-700" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-blood-700" />
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed aspect-video flex flex-col items-center justify-center cursor-pointer
                          transition-all duration-300 
                          ${dragOver ? 'border-blood-600 bg-blood-950/30' : 'border-white/10 hover:border-blood-800/60 hover:bg-blood-950/10'}`}
            >
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="text-4xl mb-4 opacity-30">🎞</div>
              <p className="text-sm text-[var(--text-secondary)] font-body">
                Drop screenshot here or <span className="text-blood-400 underline">browse</span>
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG, WebP — max 10MB</p>
            </div>
          )}
        </div>

        {/* Movie Title */}
        <div className="space-y-1">
          <label className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
            Movie Title *
          </label>
          <input
            type="text"
            name="movieTitle"
            value={form.movieTitle}
            onChange={handleChange}
            placeholder="e.g. Blade Runner 2049"
            required
            maxLength={150}
            className="input-field"
          />
          <div className="text-right text-xs font-mono text-[var(--text-muted)]">
            {form.movieTitle.length}/150
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)]">
            Review / Description *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What made this moment worth capturing? Share your thoughts..."
            required
            rows={6}
            maxLength={2000}
            className="input-field resize-none leading-relaxed"
          />
          <div className="text-right text-xs font-mono text-[var(--text-muted)]">
            {form.description.length}/2000
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="btn-primary flex-1 text-center">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-blood-300/30 border-t-blood-300 rounded-full animate-spin" />
                Uploading...
              </span>
            ) : 'Publish Post'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost px-6">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}