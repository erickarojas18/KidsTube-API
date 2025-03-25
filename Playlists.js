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