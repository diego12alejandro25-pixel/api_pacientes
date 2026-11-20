const API_URL = import.meta.env.VITE_API_URL || "https://apipacientes.adsocartago.com/api";

const procesarRespuesta = async (respuesta, accionPorDefecto) => {
    let resultado = null;
    try {
        resultado = await respuesta.json();
    } catch {
        // En caso de que la respuesta no sea JSON válido
    }

    if (!respuesta.ok || (resultado && resultado.exito === false)) {
        const mensaje = resultado?.mensaje || `Error al ${accionPorDefecto} (HTTP ${respuesta.status})`;
        throw new Error(mensaje);
    }

    return resultado;
};

// LISTAR PACIENTES
export const listarPacientes = async () => {
    const respuesta = await fetch(`${API_URL}/listar.php`);
    return await procesarRespuesta(respuesta, "listar pacientes");
};

// CONSULTAR PACIENTE POR ID
export const verPaciente = async (id) => {
    const respuesta = await fetch(`${API_URL}/ver.php?id=${encodeURIComponent(id)}`);
    return await procesarRespuesta(respuesta, "consultar el paciente");
};

// CREAR PACIENTE
export const crearPaciente = async (paciente) => {
    const respuesta = await fetch(`${API_URL}/crear.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: String(paciente.name || "").trim(),
            age: Number(paciente.age),
            gender: paciente.gender,
            diagnosis: String(paciente.diagnosis || "").trim()
        })
    });
    return await procesarRespuesta(respuesta, "crear paciente");
};

// ACTUALIZAR PACIENTE
export const actualizarPaciente = async (paciente) => {
    const respuesta = await fetch(`${API_URL}/actualizar.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: Number(paciente.id),
            name: String(paciente.name || "").trim(),
            age: Number(paciente.age),
            gender: paciente.gender,
            diagnosis: String(paciente.diagnosis || "").trim()
        })
    });
    return await procesarRespuesta(respuesta, "actualizar paciente");
};

// ELIMINAR PACIENTE
export const eliminarPaciente = async (id) => {
    const respuesta = await fetch(`${API_URL}/eliminar.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: Number(id)
        })
    });
    return await procesarRespuesta(respuesta, "eliminar paciente");
};
