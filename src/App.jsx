import { useEffect, useState } from "react";

import {
    listarPacientes,
    crearPaciente,
    verPaciente,
    actualizarPaciente,
    eliminarPaciente
} from "./services/pacienteServicios";

function App() {

    // ESTADOS PRINCIPALES
    const [pacientes, setPacientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const [busqueda, setBusqueda] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    // ESTADOS MODAL REGISTRO (CREAR)
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [errorRegistro, setErrorRegistro] = useState("");
    const [nuevoPaciente, setNuevoPaciente] = useState({
        name: "",
        age: "",
        gender: "M",
        diagnosis: ""
    });

    // ESTADOS MODAL VER DETALLES
    const [mostrarModalVer, setMostrarModalVer] = useState(false);
    const [pacienteVer, setPacienteVer] = useState(null);
    const [cargandoVer, setCargandoVer] = useState(false);
    const [errorVer, setErrorVer] = useState("");
    const [idVerActual, setIdVerActual] = useState(null);

    // ESTADOS MODAL EDITAR
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [guardandoEditar, setGuardandoEditar] = useState(false);
    const [errorEditar, setErrorEditar] = useState("");
    const [pacienteEditar, setPacienteEditar] = useState({
        id: "",
        name: "",
        age: "",
        gender: "M",
        diagnosis: ""
    });

    // ESTADOS MODAL ELIMINAR
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [pacienteEliminar, setPacienteEliminar] = useState(null);
    const [eliminando, setEliminando] = useState(false);
    const [errorEliminar, setErrorEliminar] = useState("");


    // CARGAR PACIENTES
    const cargarPacientes = async () => {

        try {

            setCargando(true);
            setError("");

            const resultado = await listarPacientes();

            if (resultado.exito) {

                setPacientes(resultado.datos || []);

            } else {

                setError(resultado.mensaje || "No se pudieron cargar los pacientes");

            }

        } catch (error) {

            console.error("Error al cargar pacientes:", error);

            setError(error.message || "No fue posible conectar con la API");

        } finally {

            setCargando(false);

        }

    };


    // REGISTRAR PACIENTE
    const registrarPaciente = async (e) => {

        e.preventDefault();

        if (guardando) return;

        // Validaciones preventivas
        if (!nuevoPaciente.name.trim() || nuevoPaciente.name.trim().length < 3) {
            setErrorRegistro("El nombre debe tener al menos 3 caracteres.");
            return;
        }

        if (nuevoPaciente.age === "" || isNaN(Number(nuevoPaciente.age)) || Number(nuevoPaciente.age) < 0 || Number(nuevoPaciente.age) > 120) {
            setErrorRegistro("Ingrese una edad válida (entre 0 y 120 años).");
            return;
        }

        if (!nuevoPaciente.diagnosis.trim() || nuevoPaciente.diagnosis.trim().length < 2) {
            setErrorRegistro("El diagnóstico debe tener al menos 2 caracteres.");
            return;
        }

        try {

            setGuardando(true);
            setErrorRegistro("");
            setMensajeExito("");

            // PREPARAR DATOS
            const paciente = {
                name: nuevoPaciente.name.trim(),
                age: Number(nuevoPaciente.age),
                gender: nuevoPaciente.gender,
                diagnosis: nuevoPaciente.diagnosis.trim()
            };

            // ENVIAR A LA API
            const resultado = await crearPaciente(paciente);

            if (resultado.exito) {

                // CERRAR FORMULARIO
                setMostrarFormulario(false);

                // LIMPIAR CAMPOS
                setNuevoPaciente({
                    name: "",
                    age: "",
                    gender: "M",
                    diagnosis: ""
                });

                // MENSAJE
                setMensajeExito("Paciente registrado exitosamente.");

                // ACTUALIZAR LISTADO
                await cargarPacientes();

            }

        } catch (error) {

            console.error("Error al registrar paciente:", error);

            setErrorRegistro(
                error.message || "Ocurrió un error al registrar el paciente"
            );

        } finally {

            setGuardando(false);

        }

    };


    // ACTUALIZAR CAMPOS DEL FORMULARIO DE REGISTRO
    const actualizarCampo = (campo, valor) => {

        setNuevoPaciente({
            ...nuevoPaciente,
            [campo]: valor
        });

    };


    // ABRIR FORMULARIO DE REGISTRO
    const abrirFormulario = () => {

        setErrorRegistro("");
        setMensajeExito("");

        setNuevoPaciente({
            name: "",
            age: "",
            gender: "M",
            diagnosis: ""
        });

        setMostrarFormulario(true);

    };


    // CERRAR FORMULARIO DE REGISTRO
    const cerrarFormulario = () => {

        if (guardando) return;

        setMostrarFormulario(false);
        setErrorRegistro("");

    };


    // VER DETALLES DE UN PACIENTE
    const abrirModalVer = async (id) => {

        setIdVerActual(id);
        setMostrarModalVer(true);
        setCargandoVer(true);
        setErrorVer("");
        setPacienteVer(null);

        try {

            const resultado = await verPaciente(id);

            if (resultado.exito && resultado.datos) {

                setPacienteVer(resultado.datos);

            } else if (resultado.datos) {

                setPacienteVer(resultado.datos);

            } else {

                setPacienteVer(resultado);

            }

        } catch (error) {

            console.error("Error al consultar paciente:", error);

            setErrorVer(error.message || "No se pudo obtener la información del paciente.");

        } finally {

            setCargandoVer(false);

        }

    };

    const reintentarVer = () => {

        if (idVerActual) {
            abrirModalVer(idVerActual);
        }

    };

    const cerrarModalVer = () => {

        setMostrarModalVer(false);
        setPacienteVer(null);
        setErrorVer("");
        setIdVerActual(null);

    };


    // EDITAR PACIENTE
    const abrirModalEditar = (paciente) => {

        setErrorEditar("");
        setPacienteEditar({
            id: paciente.id,
            name: paciente.name || "",
            age: paciente.age ?? "",
            gender: paciente.gender || "M",
            diagnosis: paciente.diagnosis || ""
        });

        setMostrarModalEditar(true);

    };

    const cerrarModalEditar = () => {

        if (guardandoEditar) return;

        setMostrarModalEditar(false);
        setErrorEditar("");

    };

    const actualizarCampoEdicion = (campo, valor) => {

        setPacienteEditar((prev) => ({
            ...prev,
            [campo]: valor
        }));

    };

    const guardarEdicion = async (e) => {

        e.preventDefault();

        if (guardandoEditar) return;

        // Validaciones preventivas
        if (!pacienteEditar.name || pacienteEditar.name.trim().length < 3) {
            setErrorEditar("El nombre debe tener al menos 3 caracteres.");
            return;
        }

        if (pacienteEditar.age === "" || isNaN(Number(pacienteEditar.age)) || Number(pacienteEditar.age) < 0 || Number(pacienteEditar.age) > 120) {
            setErrorEditar("Ingrese una edad válida (entre 0 y 120 años).");
            return;
        }

        if (!["M", "F"].includes(pacienteEditar.gender)) {
            setErrorEditar("Seleccione un género válido.");
            return;
        }

        if (!pacienteEditar.diagnosis || pacienteEditar.diagnosis.trim().length < 2) {
            setErrorEditar("El diagnóstico debe tener al menos 2 caracteres.");
            return;
        }

        try {

            setGuardandoEditar(true);
            setErrorEditar("");

            const pacienteAEnviar = {
                id: Number(pacienteEditar.id),
                name: pacienteEditar.name.trim(),
                age: Number(pacienteEditar.age),
                gender: pacienteEditar.gender,
                diagnosis: pacienteEditar.diagnosis.trim()
            };

            const resultado = await actualizarPaciente(pacienteAEnviar);

            if (resultado.exito) {

                setMostrarModalEditar(false);
                setMensajeExito("Paciente actualizado exitosamente.");
                await cargarPacientes();

            } else {

                setErrorEditar(resultado.mensaje || "Error al actualizar el paciente");

            }

        } catch (error) {

            console.error("Error al actualizar paciente:", error);

            setErrorEditar(
                error.message || "Ocurrió un error al actualizar el paciente"
            );

        } finally {

            setGuardandoEditar(false);

        }

    };


    // ELIMINAR PACIENTE
    const abrirModalEliminar = (paciente) => {

        setPacienteEliminar(paciente);
        setErrorEliminar("");
        setMostrarModalEliminar(true);

    };

    const cerrarModalEliminar = () => {

        if (eliminando) return;

        setMostrarModalEliminar(false);
        setPacienteEliminar(null);
        setErrorEliminar("");

    };

    const confirmarEliminar = async () => {

        if (!pacienteEliminar || eliminando) return;

        try {

            setEliminando(true);
            setErrorEliminar("");

            const resultado = await eliminarPaciente(pacienteEliminar.id);

            if (resultado.exito) {

                setMostrarModalEliminar(false);
                setPacienteEliminar(null);
                setMensajeExito("Paciente eliminado exitosamente.");
                await cargarPacientes();

            } else {

                setErrorEliminar(resultado.mensaje || "Error al eliminar el paciente");

            }

        } catch (error) {

            console.error("Error al eliminar paciente:", error);

            setErrorEliminar(
                error.message || "Ocurrió un error al eliminar el paciente"
            );

        } finally {

            setEliminando(false);

        }

    };


    // AUTO-OCULTAR MENSAJE DE ÉXITO TRAS 5 SEGUNDOS
    useEffect(() => {

        if (!mensajeExito) return;

        const temporizador = setTimeout(() => {
            setMensajeExito("");
        }, 5000);

        return () => clearTimeout(temporizador);

    }, [mensajeExito]);


    // CARGAR AL INICIAR
    useEffect(() => {

        let ignorar = false;

        const fetchInicial = async () => {

            try {

                setError("");

                const resultado = await listarPacientes();

                if (!ignorar) {

                    if (resultado.exito) {

                        setPacientes(resultado.datos || []);

                    } else {

                        setError(resultado.mensaje || "No se pudieron cargar los pacientes");

                    }

                }

            } catch (error) {

                if (!ignorar) {

                    console.error("Error al cargar pacientes:", error);

                    setError(error.message || "No fue posible conectar con la API");

                }

            } finally {

                if (!ignorar) {

                    setCargando(false);

                }

            }

        };

        fetchInicial();

        return () => {

            ignorar = true;

        };

    }, []);


    // BUSCADOR
    const pacientesFiltrados = pacientes.filter((paciente) => {

        const nombre = String(paciente.name || "").toLowerCase();
        const diagnostico = String(paciente.diagnosis || "").toLowerCase();
        const id = String(paciente.id || "");
        const textoBusqueda = busqueda.toLowerCase();

        return (
            nombre.includes(textoBusqueda) ||
            diagnostico.includes(textoBusqueda) ||
            id.includes(textoBusqueda)
        );

    });


    // CONTADORES
    const totalPacientes = pacientes.length;

    const pacientesMasculinos = pacientes.filter(
        (paciente) => paciente.gender === "M"
    ).length;

    const pacientesFemeninos = pacientes.filter(
        (paciente) => paciente.gender === "F"
    ).length;


    // INTERFAZ
    return (

        <div className="min-h-screen bg-slate-100 flex">


            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 text-white min-h-screen hidden md:flex flex-col">

                {/* LOGO */}
                <div className="p-6 border-b border-slate-700">

                    <h1 className="text-2xl font-bold">
                        Pacientes<span className="text-cyan-400"></span>
                    </h1>

                    <p className="text-slate-400 text-sm mt-1">
                        Gestión de pacientes
                    </p>

                </div>


                {/* NAVEGACIÓN */}
                <nav className="p-4 space-y-2">

                    <button
                        className="w-full text-left px-4 py-3 rounded-lg bg-cyan-600 text-white font-medium"
                    >
                        🏠 Dashboard
                    </button>

                </nav>


                {/* ESTADO API */}
                <div className="mt-auto p-5 border-t border-slate-700">

                    <p className="text-sm text-slate-400">
                        API Pacientes
                    </p>

                    <p className="text-sm text-green-400 mt-1 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Conectada
                    </p>

                </div>

            </aside>


            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 p-6 md:p-10">


                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

                    <div>

                        <h2 className="text-3xl font-bold text-slate-800">
                            Dashboard
                        </h2>

                        <p className="text-slate-500 mt-1">
                            Administración y seguimiento de pacientes
                        </p>

                    </div>


                    {/* BOTONES */}
                    <div className="flex gap-3 flex-wrap">

                        <button
                            onClick={abrirFormulario}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-5 py-3 rounded-xl transition shadow-sm cursor-pointer"
                        >
                            + Nuevo paciente
                        </button>

                        <button
                            onClick={cargarPacientes}
                            disabled={cargando}
                            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl transition disabled:opacity-50 cursor-pointer"
                        >
                            ↻ Actualizar
                        </button>

                    </div>

                </header>


                {/* MENSAJE DE ÉXITO */}
                {mensajeExito && (

                    <div className="mb-6 bg-green-50 border border-green-300 text-green-800 p-4 rounded-xl flex justify-between items-center shadow-sm">

                        <span className="font-medium flex items-center gap-2">
                            ✓ {mensajeExito}
                        </span>

                        <button
                            onClick={() => setMensajeExito("")}
                            className="text-green-700 hover:text-green-900 font-bold text-lg px-2"
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* ESTADÍSTICAS */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">


                    {/* TOTAL */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">

                        <div className="flex justify-between items-center">

                            <p className="text-slate-500 text-sm">
                                Total de pacientes
                            </p>

                            <span className="bg-cyan-100 text-cyan-700 p-3 rounded-xl">
                                👥
                            </span>

                        </div>

                        <h3 className="text-3xl font-bold text-slate-800 mt-3">
                            {totalPacientes}
                        </h3>

                        <p className="text-cyan-600 text-sm mt-2 font-medium">
                            Pacientes registrados
                        </p>

                    </div>


                    {/* MASCULINOS */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">

                        <div className="flex justify-between items-center">

                            <p className="text-slate-500 text-sm">
                                Pacientes masculinos
                            </p>

                            <span className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                                ♂
                            </span>

                        </div>

                        <h3 className="text-3xl font-bold text-slate-800 mt-3">
                            {pacientesMasculinos}
                        </h3>

                        <p className="text-blue-600 text-sm mt-2 font-medium">
                            Registrados
                        </p>

                    </div>


                    {/* FEMENINOS */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">

                        <div className="flex justify-between items-center">

                            <p className="text-slate-500 text-sm">
                                Pacientes femeninos
                            </p>

                            <span className="bg-purple-100 text-purple-700 p-3 rounded-xl">
                                ♀
                            </span>

                        </div>

                        <h3 className="text-3xl font-bold text-slate-800 mt-3">
                            {pacientesFemeninos}
                        </h3>

                        <p className="text-purple-600 text-sm mt-2 font-medium">
                            Registrados
                        </p>

                    </div>

                </section>


                {/* TABLA DE PACIENTES */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">


                    {/* CABECERA TABLA */}
                    <div className="p-6 flex flex-col md:flex-row justify-between gap-4">

                        <div>

                            <h3 className="text-xl font-bold text-slate-800">
                                Pacientes
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Listado de pacientes registrados
                            </p>

                        </div>


                        {/* BUSCADOR */}
                        <input
                            type="text"
                            placeholder="Buscar por nombre, ID o diagnóstico..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500 w-full md:w-80"
                        />

                    </div>


                    {/* CARGANDO */}
                    {cargando && (

                        <div className="p-10 text-center text-slate-500">

                            <p className="animate-pulse">
                                Cargando pacientes...
                            </p>

                        </div>

                    )}


                    {/* ERROR */}
                    {!cargando && error && (

                        <div className="p-10 text-center">

                            <p className="text-red-500 mb-4 font-medium">
                                {error}
                            </p>

                            <button
                                onClick={cargarPacientes}
                                className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl hover:bg-cyan-700 transition cursor-pointer"
                            >
                                Reintentar
                            </button>

                        </div>

                    )}


                    {/* TABLA */}
                    {!cargando && !error && (

                        <div className="overflow-x-auto">

                            <table className="w-full text-left">


                                {/* COLUMNAS */}
                                <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">

                                    <tr>

                                        <th className="px-6 py-4 font-semibold">
                                            ID
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Paciente
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Edad
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Género
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Diagnóstico
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Registro
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-center">
                                            Acciones
                                        </th>

                                    </tr>

                                </thead>


                                {/* DATOS */}
                                <tbody className="divide-y divide-slate-100">

                                    {pacientesFiltrados.map((paciente) => (

                                        <tr
                                            key={paciente.id}
                                            className="hover:bg-slate-50/80 transition"
                                        >

                                            <td className="px-6 py-4 text-slate-500 font-mono text-sm">
                                                #{paciente.id}
                                            </td>


                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {paciente.name}
                                            </td>


                                            <td className="px-6 py-4 text-slate-600">
                                                {paciente.age} años
                                            </td>


                                            <td className="px-6 py-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${paciente.gender === "F"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-blue-100 text-blue-700"
                                                        }`}
                                                >

                                                    {paciente.gender === "F"
                                                        ? "Femenino"
                                                        : "Masculino"}

                                                </span>

                                            </td>


                                            <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={paciente.diagnosis}>
                                                {paciente.diagnosis}
                                            </td>


                                            <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                                                {paciente.created_at || "—"}
                                            </td>


                                            {/* ACCIONES */}
                                            <td className="px-6 py-4">

                                                <div className="flex items-center justify-center gap-2">

                                                    {/* VER */}
                                                    <button
                                                        onClick={() => abrirModalVer(paciente.id)}
                                                        title="Ver detalles del paciente"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition border border-cyan-200 cursor-pointer"
                                                    >
                                                        👁️ Ver
                                                    </button>

                                                    {/* EDITAR */}
                                                    <button
                                                        onClick={() => abrirModalEditar(paciente)}
                                                        title="Editar paciente"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200 cursor-pointer"
                                                    >
                                                        ✏️ Editar
                                                    </button>

                                                    {/* ELIMINAR */}
                                                    <button
                                                        onClick={() => abrirModalEliminar(paciente)}
                                                        title="Eliminar paciente"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition border border-red-200 cursor-pointer"
                                                    >
                                                        🗑️ Eliminar
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}


                                    {/* SIN RESULTADOS */}
                                    {pacientesFiltrados.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="text-center py-10 text-slate-500"
                                            >
                                                No se encontraron pacientes.
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* MODAL REGISTRO (CREAR PACIENTE) */}
                {mostrarFormulario && (

                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">

                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">


                            {/* HEADER MODAL */}
                            <div className="flex justify-between items-center mb-6">

                                <div>

                                    <h2 className="text-2xl font-bold text-slate-800">
                                        Registrar paciente
                                    </h2>

                                    <p className="text-slate-500 text-sm mt-1">
                                        Completa los datos del nuevo paciente
                                    </p>

                                </div>


                                <button
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                    className="text-slate-400 hover:text-slate-700 text-2xl disabled:opacity-50 cursor-pointer"
                                    title="Cerrar"
                                >
                                    ×
                                </button>

                            </div>


                            {/* ERROR REGISTRO */}
                            {errorRegistro && (

                                <div className="mb-4 bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl text-sm">
                                    {errorRegistro}
                                </div>

                            )}


                            {/* FORMULARIO */}
                            <form
                                onSubmit={registrarPaciente}
                                className="space-y-4"
                            >


                                {/* NOMBRE */}
                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nombre completo <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        value={nuevoPaciente.name}
                                        onChange={(e) =>
                                            actualizarCampo("name", e.target.value)
                                        }
                                        placeholder="Ej. Juan Pérez"
                                        required
                                        minLength="3"
                                        maxLength="100"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                                    />

                                </div>


                                {/* EDAD */}
                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Edad <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        type="number"
                                        value={nuevoPaciente.age}
                                        onChange={(e) =>
                                            actualizarCampo("age", e.target.value)
                                        }
                                        min="0"
                                        max="120"
                                        placeholder="Ingrese la edad"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500"
                                    />

                                </div>


                                {/* GÉNERO */}
                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Género <span className="text-red-500">*</span>
                                    </label>

                                    <select
                                        value={nuevoPaciente.gender}
                                        onChange={(e) =>
                                            actualizarCampo("gender", e.target.value)
                                        }
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                                    >

                                        <option value="M">
                                            Masculino
                                        </option>

                                        <option value="F">
                                            Femenino
                                        </option>

                                    </select>

                                </div>


                                {/* DIAGNÓSTICO */}
                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Diagnóstico <span className="text-red-500">*</span>
                                    </label>

                                    <textarea
                                        value={nuevoPaciente.diagnosis}
                                        onChange={(e) =>
                                            actualizarCampo("diagnosis", e.target.value)
                                        }
                                        placeholder="Ingrese el diagnóstico"
                                        required
                                        minLength="2"
                                        maxLength="500"
                                        rows="3"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                                    />

                                </div>


                                {/* BOTONES */}
                                <div className="flex justify-end gap-3 pt-4">


                                    {/* CANCELAR */}
                                    <button
                                        type="button"
                                        onClick={cerrarFormulario}
                                        disabled={guardando}
                                        className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                    >
                                        Cancelar
                                    </button>


                                    {/* GUARDAR */}
                                    <button
                                        type="submit"
                                        disabled={guardando}
                                        className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium disabled:opacity-50 transition cursor-pointer"
                                    >

                                        {guardando
                                            ? "Guardando..."
                                            : "Registrar paciente"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}


                {/* MODAL VER DETALLES */}
                {mostrarModalVer && (

                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">

                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">


                            {/* HEADER MODAL */}
                            <div className="flex justify-between items-center mb-6">

                                <div>

                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                        <span>👁️</span> Detalles del paciente
                                    </h2>

                                    <p className="text-slate-500 text-sm mt-1">
                                        Información consultada desde la API
                                    </p>

                                </div>


                                <button
                                    onClick={cerrarModalVer}
                                    className="text-slate-400 hover:text-slate-700 text-2xl cursor-pointer"
                                    title="Cerrar"
                                >
                                    ×
                                </button>

                            </div>


                            {/* ESTADO CARGANDO */}
                            {cargandoVer && (

                                <div className="py-12 text-center text-slate-500">

                                    <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>

                                    <p className="font-medium text-slate-600">
                                        Cargando información del paciente...
                                    </p>

                                </div>

                            )}


                            {/* ESTADO ERROR */}
                            {!cargandoVer && errorVer && (

                                <div className="py-6 text-center">

                                    <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-xl text-sm mb-4">
                                        {errorVer}
                                    </div>

                                    <div className="flex justify-center gap-3">

                                        <button
                                            onClick={reintentarVer}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-medium transition cursor-pointer"
                                        >
                                            Reintentar
                                        </button>

                                        <button
                                            onClick={cerrarModalVer}
                                            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm transition cursor-pointer"
                                        >
                                            Cerrar
                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* INFORMACIÓN DEL PACIENTE */}
                            {!cargandoVer && !errorVer && pacienteVer && (

                                <div className="space-y-4">


                                    {/* IDENTIFICACIÓN Y GÉNERO */}
                                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">

                                        <div>

                                            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                                                Identificador
                                            </span>

                                            <span className="text-lg font-mono font-bold text-slate-800">
                                                #{pacienteVer.id}
                                            </span>

                                        </div>


                                        <span
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${pacienteVer.gender === "F"
                                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                                : "bg-blue-100 text-blue-700 border border-blue-200"
                                                }`}
                                        >

                                            {pacienteVer.gender === "F"
                                                ? "♀ Femenino"
                                                : "♂ Masculino"}

                                        </span>

                                    </div>


                                    {/* NOMBRE */}
                                    <div>

                                        <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                                            Nombre completo
                                        </label>

                                        <p className="text-xl font-bold text-slate-800">
                                            {pacienteVer.name}
                                        </p>

                                    </div>


                                    {/* EDAD */}
                                    <div>

                                        <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                                            Edad
                                        </label>

                                        <p className="text-base text-slate-700 font-medium">
                                            {pacienteVer.age} años
                                        </p>

                                    </div>


                                    {/* DIAGNÓSTICO */}
                                    <div>

                                        <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                                            Diagnóstico médico
                                        </label>

                                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                            {pacienteVer.diagnosis || "Sin diagnóstico registrado"}
                                        </div>

                                    </div>


                                    {/* FECHA DE REGISTRO */}
                                    {pacienteVer.created_at && (

                                        <div>

                                            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                                                Fecha de creación
                                            </label>

                                            <p className="text-sm text-slate-500 font-mono">
                                                {pacienteVer.created_at}
                                            </p>

                                        </div>

                                    )}


                                    {/* BOTONES ACCIÓN MODAL */}
                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">

                                        <button
                                            type="button"
                                            onClick={cerrarModalVer}
                                            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition cursor-pointer"
                                        >
                                            Cerrar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                cerrarModalVer();
                                                abrirModalEditar(pacienteVer);
                                            }}
                                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition cursor-pointer"
                                        >
                                            ✏️ Editar datos
                                        </button>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                )}


                {/* MODAL EDITAR PACIENTE */}
                {mostrarModalEditar && (

                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">

                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">


                            {/* HEADER MODAL */}
                            <div className="flex justify-between items-center mb-6">

                                <div>

                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                        <span>✏️</span> Editar paciente
                                    </h2>

                                    <p className="text-slate-500 text-sm mt-1">
                                        Modificando el paciente #{pacienteEditar.id}
                                    </p>

                                </div>


                                <button
                                    onClick={cerrarModalEditar}
                                    disabled={guardandoEditar}
                                    className="text-slate-400 hover:text-slate-700 text-2xl disabled:opacity-50 cursor-pointer"
                                    title="Cerrar"
                                >
                                    ×
                                </button>

                            </div>


                            {/* ERROR EDICIÓN */}
                            {errorEditar && (

                                <div className="mb-4 bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl text-sm">
                                    {errorEditar}
                                </div>

                            )}


                            {/* FORMULARIO */}
                            <form
                                onSubmit={guardarEdicion}
                                className="space-y-4"
                            >


                                {/* ID (SOLO LECTURA) */}
                                <div>

                                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                                        ID de paciente
                                    </label>

                                    <input
                                        type="text"
                                        value={`#${pacienteEditar.id}`}
                                        disabled
                                        className="w-full border border-slate-200 bg-slate-100 text-slate-500 font-mono rounded-xl px-4 py-2.5 cursor-not-allowed"
                                    />

                                </div>


                                {/* NOMBRE */}
                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nombre completo <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        value={pacienteEditar.name}
                                        onChange={(e) =>
                                            actualizarCampoEdicion("name", e.target.value)
                                        }
                                        placeholder="Ej. Juan Pérez"
                                        required
                                        minLength="3"
                                        maxLength="100"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500"
                                    />

                                </div>


                                {/* EDAD */}
                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Edad <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        type="number"
                                        value={pacienteEditar.age}
                                        onChange={(e) =>
                                            actualizarCampoEdicion("age", e.target.value)
                                        }
                                        min="0"
                                        max="120"
                                        placeholder="Ingrese la edad"
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500"
                                    />

                                </div>


                                {/* GÉNERO */}
                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Género <span className="text-red-500">*</span>
                                    </label>

                                    <select
                                        value={pacienteEditar.gender}
                                        onChange={(e) =>
                                            actualizarCampoEdicion("gender", e.target.value)
                                        }
                                        required
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                    >

                                        <option value="M">
                                            Masculino
                                        </option>

                                        <option value="F">
                                            Femenino
                                        </option>

                                    </select>

                                </div>


                                {/* DIAGNÓSTICO */}
                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Diagnóstico <span className="text-red-500">*</span>
                                    </label>

                                    <textarea
                                        value={pacienteEditar.diagnosis}
                                        onChange={(e) =>
                                            actualizarCampoEdicion("diagnosis", e.target.value)
                                        }
                                        placeholder="Ingrese el diagnóstico"
                                        required
                                        minLength="2"
                                        maxLength="500"
                                        rows="3"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                                    />

                                </div>


                                {/* BOTONES */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">


                                    {/* CANCELAR */}
                                    <button
                                        type="button"
                                        onClick={cerrarModalEditar}
                                        disabled={guardandoEditar}
                                        className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                                    >
                                        Cancelar
                                    </button>


                                    {/* GUARDAR CAMBIOS */}
                                    <button
                                        type="submit"
                                        disabled={guardandoEditar}
                                        className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium disabled:opacity-50 transition cursor-pointer"
                                    >

                                        {guardandoEditar
                                            ? "Guardando cambios..."
                                            : "Guardar cambios"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}


                {/* MODAL CONFIRMAR ELIMINACIÓN */}
                {mostrarModalEliminar && (

                    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">

                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">


                            {/* ÍCONO Y ENCABEZADO */}
                            <div className="text-center mb-5">

                                <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-3">
                                    🗑️
                                </div>

                                <h2 className="text-2xl font-bold text-slate-800">
                                    ¿Eliminar paciente?
                                </h2>

                                <p className="text-slate-500 text-sm mt-1">
                                    Esta acción no se puede deshacer
                                </p>

                            </div>


                            {/* DETALLE PACIENTE A ELIMINAR */}
                            {pacienteEliminar && (

                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-center">

                                    <p className="font-bold text-slate-800 text-lg">
                                        {pacienteEliminar.name}
                                    </p>

                                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                                        ID: #{pacienteEliminar.id} · {pacienteEliminar.age} años · {pacienteEliminar.gender === "F" ? "Femenino" : "Masculino"}
                                    </p>

                                    {pacienteEliminar.diagnosis && (
                                        <p className="text-xs text-slate-600 italic mt-2 line-clamp-2">
                                            "{pacienteEliminar.diagnosis}"
                                        </p>
                                    )}

                                </div>

                            )}


                            {/* ERROR ELIMINAR */}
                            {errorEliminar && (

                                <div className="mb-4 bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl text-sm">
                                    {errorEliminar}
                                </div>

                            )}


                            {/* BOTONES */}
                            <div className="flex justify-end gap-3 pt-2">


                                {/* CANCELAR */}
                                <button
                                    type="button"
                                    onClick={cerrarModalEliminar}
                                    disabled={eliminando}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 font-medium transition cursor-pointer"
                                >
                                    Cancelar
                                </button>


                                {/* CONFIRMAR ELIMINACIÓN */}
                                <button
                                    type="button"
                                    onClick={confirmarEliminar}
                                    disabled={eliminando}
                                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 transition cursor-pointer"
                                >

                                    {eliminando
                                        ? "Eliminando..."
                                        : "Sí, eliminar"}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>

    );

}

export default App;
