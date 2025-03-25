import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../selectProfile.css";

const SelectProfile = () => {
  const [profiles, setProfiles] = useState([]);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ No se encontró un userId en localStorage");
      return;
    }

    axios
      .get(`http://localhost:5000/api/restricted-users/${userId}`)
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setProfiles(response.data);
        } else {
          console.warn("⚠️ La respuesta no contiene un arreglo de perfiles.");
        }
      })
      .catch((error) => {
        console.error("❌ Error al obtener perfiles:", error);
      });
  }, [userId]);

  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setRedirectPath("/Playlists");
    setShowPinModal(true);
    setError("");
    setPin("");
  };

  const handleAdminProfilesClick = () => {
    setSelectedProfile(null);
    setRedirectPath("/AdminRestricted");
    setShowPinModal(true);
    setError("");
    setPin("");
  };

  const handleAdminClick = () => {
    setSelectedProfile(null);
    setRedirectPath("/videos");
    setShowPinModal(true);
    setError("");
    setPin("");
  };

  const handlePinSubmit = async () => {
    try {
      console.log("🔑 Iniciando validación de PIN...");
      console.log("Ruta de redirección:", redirectPath);
      console.log("Perfil seleccionado:", selectedProfile);
      
      const token = localStorage.getItem('token');
      console.log("Token:", token ? "Presente" : "No encontrado");
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Validar si es acceso de administrador o perfil restringido
      const isAdminAccess = ["/videos", "/AdminRestricted"].includes(redirectPath);
      
      const endpoint = isAdminAccess
        ? "http://localhost:5000/api/validate-admin-pin"
        : "http://localhost:5000/api/restricted-users/validate-pin";

      console.log("Endpoint seleccionado:", endpoint);
      console.log("¿Es acceso de administrador?:", isAdminAccess);

      // Determinar qué userId usar
      let requestUserId;
      if (isAdminAccess) {
        requestUserId = userId; // ID del usuario administrador
        console.log("Usando ID de administrador:", requestUserId);
      } else {
        requestUserId = selectedProfile?._id; // ID del perfil restringido
        console.log("Usando ID de perfil restringido:", requestUserId);
      }

      console.log("ID de usuario a usar:", requestUserId);
      console.log("PIN ingresado:", pin);

      if (!requestUserId) {
        const errorMsg = isAdminAccess 
          ? "Error: No se encontró el ID del administrador" 
          : "Error: No se encontró el ID del perfil";
        setError(errorMsg);
        return;
      }

      if (!pin || pin.length !== 6) {
        setError("El PIN debe tener exactamente 6 dígitos");
        return;
      }
      
      const requestData = { 
        userId: requestUserId,
        pin: pin.toString() // Asegurar que el PIN sea string
      };
      
      console.log("Datos de la petición:", requestData);

      const response = await axios.post(
        endpoint,
        requestData,
        { headers }
      );

      console.log("Respuesta del servidor:", response.data);

      if (response.data && response.data.message === "PIN válido") {
        console.log("✅ PIN validado correctamente");
        setShowPinModal(false);
        
        // Si es acceso de administrador, guardar información adicional si es necesario
        if (isAdminAccess) {
          localStorage.setItem('isAdmin', 'true');
        }
        
        navigate(redirectPath);
      } else {
        setError("PIN incorrecto. Por favor, intente nuevamente ❌");
      }
    } catch (error) {
      console.error("❌ Error completo:", error);
      console.error("❌ Datos del error:", error.response?.data);
      console.error("❌ Estado del error:", error.response?.status);
      
      if (error.response?.status === 401) {
        setError(`PIN incorrecto. Por favor, intente nuevamente ❌`);
      } else if (error.response?.status === 404) {
        const errorMsg = redirectPath === "/videos"
          ? "Usuario administrador no encontrado ❌"
          : "Perfil restringido no encontrado ❌";
        setError(errorMsg);
      } else {
        setError("Error al validar el PIN. Por favor, intente nuevamente ❌");
      }
    }
  };

  return (
    <div className="container">
      <h2>Selecciona un perfil</h2>

      {profiles.length === 0 ? (
        <p>No se han creado perfiles aún. Por favor, agrega un perfil.</p>
      ) : (
        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div
              key={profile._id}
              className="profile-card"
              onClick={() => handleProfileClick(profile)}
            >
              <img
                src={
                  profile.avatar
                    ? `/avatars/${profile.avatar}`
                    : "/avatars/default-avatar.png"
                }
                alt={profile.name}
                className="profile-avatar"
              />
              <p className="profile-name">{profile.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Botones de acción */}
      <div className="actions">
        <button
          className="circle-btn"
          onClick={() => navigate("/new-profile")}
        >
          ➕
        </button>
        <button className="circle-btn" onClick={handleAdminProfilesClick}>
          ⚙️
        </button>
        <button className="circle-btn" onClick={handleAdminClick}>
          📂
        </button>
      </div>

      {/* Modal para ingresar PIN */}
      {showPinModal && (
        <div className="modal-overlay">
          <div className="modal-wrapper">
            <div className="modal-content">
              <h3>Ingrese el PIN</h3>
              <input
                type="password"
                maxLength="6"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="pin-input"
                placeholder="******"
              />
              {error && <p className="error-text">{error}</p>}
              <div className="button-group">
                <button className="btn validate" onClick={handlePinSubmit}>
                  Validar
                </button>
                <button
                  className="btn cancel"
                  onClick={() => setShowPinModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectProfile; 