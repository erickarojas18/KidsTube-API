import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Form, Button, Card } from 'react-bootstrap';
import Select from 'react-select';

const [showEditModal, setShowEditModal] = useState(false);
const [editFormData, setEditFormData] = useState({ name: '', profiles: [] });
const [editingPlaylistId, setEditingPlaylistId] = useState(null);

const handleAddVideoToPlaylist = async (video) => {
    try {
        if (!selectedPlaylist?._id) {
            setError("No hay playlist seleccionada");
            return;
        }

        if (!video?._id) {
            setError("Video no válido");
            return;
        }

        if (selectedPlaylist.videos?.some(v => v._id === video._id)) {
            setError("Este video ya está en la playlist");
            return;
        }

        console.log('Agregando video:', {
            playlistId: selectedPlaylist._id,
            videoId: video._id,
            selectedPlaylist: selectedPlaylist
        });

        const response = await axios.post(
            `http://localhost:5000/api/playlists/${selectedPlaylist._id}/videos`,
            { videoId: video._id }
        );

        console.log('Respuesta del servidor:', response.data);

        if (response.data) {
            // Actualizar la playlist seleccionada
            const updatedPlaylist = {
                ...selectedPlaylist,
                videos: [...(selectedPlaylist.videos || []), video]
            };
            
            setSelectedPlaylist(updatedPlaylist);
            
            // Actualizar la lista de playlists
            setPlaylists(playlists.map(p => 
                p._id === selectedPlaylist._id 
                    ? updatedPlaylist
                    : p
            ));
            
            setSuccess("¡Video agregado exitosamente! 🎉");
        }
    } catch (error) {
        console.error("Error al agregar video:", error.response || error);
        setError(error.response?.data?.error || "Error al agregar el video a la playlist");
    }
};

const handleEditPlaylist = async (playlistId, formData) => {
    try {
        console.log('Actualizando playlist:', playlistId, formData);
        
        const response = await axios.put(
            `${process.env.REACT_APP_API_URL}/api/playlists/${playlistId}`,
            formData
        );

        console.log('Respuesta completa:', response.data);

        if (response.data.playlist) {
            // Actualizar la lista de playlists
            setPlaylists(playlists.map(p => 
                p._id === playlistId ? response.data.playlist : p
            ));
            
            setShowEditModal(false);
            setSuccess('¡Playlist actualizada exitosamente! 🎉');
        }
    } catch (error) {
        console.error('Error al actualizar playlist:', error);
        setError(error.response?.data?.message || 'Error al actualizar la playlist');
    }
};

const openEditModal = (playlist) => {
    setEditingPlaylistId(playlist._id);
    setEditFormData({
        name: playlist.name,
        profiles: playlist.profiles.map(p => p._id)
    });
    setShowEditModal(true);
};

// Componente Modal de Edición
const EditPlaylistModal = ({ show, onHide, playlist, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: playlist?.name || '',
        profiles: playlist?.profiles?.map(p => p._id) || []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Editar Playlist</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Perfiles con Acceso</Form.Label>
                        <Select
                            isMulti
                            value={profiles.filter(p => formData.profiles.includes(p._id))
                                .map(p => ({ value: p._id, label: p.name }))}
                            options={profiles.map(p => ({ value: p._id, label: p.name }))}
                            onChange={(selected) => setFormData({
                                ...formData,
                                profiles: selected.map(option => option.value)
                            })}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="mt-3">
                        Guardar Cambios
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

// Modificar el renderizado de las playlists para incluir el botón de editar
const renderPlaylists = () => {
    return playlists.map((playlist) => (
        <Card key={playlist._id} className="mb-3">
            <Card.Body>
                <Card.Title>{playlist.name}</Card.Title>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-primary"
                        onClick={() => setSelectedPlaylist(playlist)}
                    >
                        Ver Videos
                    </Button>
                    <Button
                        variant="outline-success"
                        onClick={() => openEditModal(playlist)}
                    >
                        Editar
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={() => handleDeletePlaylist(playlist._id)}
                    >
                        Eliminar
                    </Button>
                </div>
            </Card.Body>
        </Card>
    ));
};

// Añadir el modal al componente principal
return (
    <div>
        {/* ... existing content ... */}
        
        <EditPlaylistModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            playlist={playlists.find(p => p._id === editingPlaylistId)}
            onSubmit={(formData) => handleEditPlaylist(editingPlaylistId, formData)}
        />
        
        {/* ... existing content ... */}
    </div>
); 