import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserPlaylists = () => {
    const [playlists, setPlaylists] = useState([]);
    const [userName, setUserName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { userId } = useParams();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError('');
                console.log('🔍 Iniciando búsqueda de datos para userId:', userId);

                // Obtener el nombre del usuario
                const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`);
                console.log('👤 Respuesta del usuario:', userResponse.data);
                
                if (userResponse.data && userResponse.data.name) {
                    setUserName(userResponse.data.name);
                }

                // Obtener las playlists del usuario
                console.log('🎵 Obteniendo playlists...');
                const playlistsResponse = await axios.get(`http://localhost:5000/api/playlists/user/${userId}`);
                console.log('📋 Respuesta de playlists:', playlistsResponse.data);
                
                if (playlistsResponse.data) {
                    setPlaylists(playlistsResponse.data);
                } else {
                    console.log('⚠️ No se recibieron playlists');
                    setPlaylists([]);
                }
            } catch (error) {
                console.error('❌ Error al obtener datos:', error);
                if (error.response) {
                    console.error('📡 Respuesta del servidor:', error.response.data);
                    setError(`Error: ${error.response.data.message || 'Error al obtener los datos'}`);
                } else {
                    setError('Error al obtener los datos');
                }
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            console.log('🚀 Iniciando fetchUserData con userId:', userId);
            fetchUserData();
        } else {
            console.log('⚠️ No se encontró userId en los parámetros');
            setError('ID de usuario no proporcionado');
            setLoading(false);
        }
    }, [userId]);

    if (loading) {
        return <div>Cargando playlists...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="user-playlists-container">
            <h2>Playlists de {userName}</h2>
            {playlists.length === 0 ? (
                <p>No hay playlists disponibles</p>
            ) : (
                <div className="playlists-grid">
                    {playlists.map(playlist => (
                        <div key={playlist._id} className="playlist-card">
                            <h3>{playlist.name}</h3>
                            <div className="playlist-info">
                                <p>Videos: {playlist.videos?.length || 0}</p>
                                <p>Miembros: {playlist.profiles?.length || 0}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserPlaylists; 