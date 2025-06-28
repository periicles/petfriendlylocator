'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, firstname, lastname }),
        })

        if (res.ok) {
            router.push('/login')
        } else {
            const data = await res.json()
            alert(data.error || 'Erreur lors de l’inscription')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Créer un compte</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                <input
                    type="text"
                    placeholder="Prénom"
                    value={firstname}
                    onChange={e => setFirstname(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    required
                />
                <input
                    type="text"
                    placeholder="Nom"
                    value={lastname}
                    onChange={e => setLastname(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    S’inscrire
                </button>
            </form>
        </div>
    )
}
