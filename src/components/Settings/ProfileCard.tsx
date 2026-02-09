'use client'

import { updateProfile } from '@/actions/auth'
import { User, Loader2, Edit2, Check, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
    displayName: string | null | undefined
    email: string
    avatarUrl?: string | null
}

export function ProfileCard({ displayName, email, avatarUrl }: Props) {
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(displayName || '')
    const [loading, setLoading] = useState(false)
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const [currentAvatar, setCurrentAvatar] = useState(avatarUrl)

    const AVATAR_PRESETS = [
        // Notion Style
        'https://api.dicebear.com/9.x/notionists/svg?seed=Felix',
        'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka',
        'https://api.dicebear.com/9.x/notionists/svg?seed=Milo',
        'https://api.dicebear.com/9.x/notionists/svg?seed=Lela',
        // Adventurer
        'https://api.dicebear.com/9.x/adventurer/svg?seed=Felix',
        'https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka',
        'https://api.dicebear.com/9.x/adventurer/svg?seed=Milo',
        'https://api.dicebear.com/9.x/adventurer/svg?seed=Lela',
        // Minimalist / Friendly
        'https://api.dicebear.com/9.x/open-peeps/svg?seed=Jude',
        'https://api.dicebear.com/9.x/open-peeps/svg?seed=Buster',
        'https://api.dicebear.com/9.x/micah/svg?seed=Lela',
        'https://api.dicebear.com/9.x/micah/svg?seed=Jude',
        // Artistic
        'https://api.dicebear.com/9.x/lorelei/svg?seed=Brooklynn',
        'https://api.dicebear.com/9.x/lorelei/svg?seed=Easton',
        'https://api.dicebear.com/9.x/miniavs/svg?seed=Robot1',
        'https://api.dicebear.com/9.x/miniavs/svg?seed=Robot2',
        // Fun / Pixel
        'https://api.dicebear.com/9.x/pixel-art/svg?seed=Pixel1',
        'https://api.dicebear.com/9.x/bottts/svg?seed=Robot1',
        'https://api.dicebear.com/9.x/bottts/svg?seed=Robot2',
        'https://api.dicebear.com/9.x/big-smile/svg?seed=Smile'
    ]

    async function handleSave() {
        if (!name.trim()) return

        setLoading(true)
        const formData = new FormData()
        formData.append('displayName', name)

        await updateProfile(formData)

        setLoading(false)
        setIsEditing(false)
    }

    async function handleAvatarSelect(url: string) {
        setLoading(true)
        setCurrentAvatar(url)
        const formData = new FormData()
        formData.append('displayName', name)
        formData.append('avatarUrl', url)

        await updateProfile(formData)
        setIsPickerOpen(false)
        setLoading(false)
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-start sm:items-center gap-6 relative">

            {/* Avatar Section */}
            <div className="relative group/avatar">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-50 shadow-inner overflow-hidden shrink-0">
                    {currentAvatar ? (
                        <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-slate-300" />
                    )}
                </div>

                {/* Edit Avatar Button */}
                <button
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full hover:bg-slate-700 transition-all shadow-md active:scale-95 border-2 border-white z-10"
                >
                    <Edit2 className="w-3 h-3" />
                </button>

                {/* Avatar Selection Popover */}
                {isPickerOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsPickerOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-3 p-3 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 w-64 animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Elige un avatar</div>
                            <div className="grid grid-cols-4 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                {AVATAR_PRESETS.map((url) => (
                                    <button
                                        key={url}
                                        onClick={() => handleAvatarSelect(url)}
                                        disabled={loading}
                                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${avatarUrl === url
                                            ? 'border-emerald-500 ring-2 ring-emerald-100'
                                            : 'border-slate-100 hover:border-emerald-200 hover:scale-105'
                                            }`}
                                    >
                                        <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            value={name || ''}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-lg font-bold text-slate-800 outline-none focus:border-emerald-500 w-full max-w-[200px]"
                            autoFocus
                        />
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false)
                                setName(displayName || '')
                            }}
                            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group">
                        <h2 className="text-xl font-bold text-slate-800 truncate">{displayName || 'Sin Nombre'}</h2>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <p className="text-slate-400 text-sm mt-0.5">{email}</p>
            </div>
        </div>
    )
}
