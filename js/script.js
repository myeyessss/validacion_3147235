// @$ SISTEMA DE VALIDACIÓN AVANZADA

document.addEventListener('DOMContentLoaded', function () {
    const formulario = document.getElementById('formularioAvanzado');
    const campos = formulario.querySelectorAll('input, textarea, select');
    const btnEnviar = document.getElementById('btnEnviar');

    let estadoValidacion = {};

    campos.forEach((campo) => {
        estadoValidacion[campo.name] = false;
        campo.addEventListener('input', validarCampo);
        campo.addEventListener('blur', validarCampo);
    });

    document.getElementById('fechaNacimiento').addEventListener('change', validarCampo);
    document.getElementById('terminos').addEventListener('change', validarCampo);
    document.getElementById('confirmarCorreo').addEventListener('paste', prevenirPegar);
    document.getElementById('confirmarPassword').addEventListener('paste', prevenirPegar);

    function prevenirPegar(e) {
        e.preventDefault();
        mostrarError('error' + e.target.id.charAt(0).toUpperCase() + e.target.id.slice(1), 'No se permite pegar en este campo');
        return false;
    }

    function validarCampo() {
        const campo = this;
        const valor = campo.value.trim();
        const nombreCampo = campo.name;

        switch (nombreCampo) {
            case 'nombres':
                estadoValidacion.nombres = validarNombresApellidos(valor, 'Nombres');
                marcarCampo(campo, estadoValidacion.nombres);
                break;
            case 'apellidos':
                estadoValidacion.apellidos = validarNombresApellidos(valor, 'Apellidos');
                marcarCampo(campo, estadoValidacion.apellidos);
                break;
            case 'correo':
                estadoValidacion.correo = validarCorreo(valor);
                marcarCampo(campo, estadoValidacion.correo);
                break;
            case 'confirmarCorreo':
                estadoValidacion.confirmarCorreo = validarConfirmacionCorreo(valor);
                marcarCampo(campo, estadoValidacion.confirmarCorreo);
                break;
            case 'password':
                estadoValidacion.password = validarPassword(valor);
                marcarCampo(campo, estadoValidacion.password);
                const confirmar = document.getElementById('confirmarPassword');
                if (confirmar.value) confirmar.dispatchEvent(new Event('input'));
                break;
            case 'confirmarPassword':
                estadoValidacion.confirmarPassword = validarConfirmacionPassword(valor);
                marcarCampo(campo, estadoValidacion.confirmarPassword);
                break;
            case 'telefono':
                estadoValidacion.telefono = validarTelefono(campo);
                marcarCampo(campo, estadoValidacion.telefono);
                break;
            case 'fechaNacimiento':
                estadoValidacion.fechaNacimiento = validarFechaNacimiento(valor);
                marcarCampo(campo, estadoValidacion.fechaNacimiento);
                break;
            case 'terminos':
                estadoValidacion.terminos = campo.checked;
                if (!campo.checked) {
                    mostrarError('errorTerminos', 'Debes aceptar los términos y condiciones');
                } else {
                    ocultarMensaje('errorTerminos');
                }
                break;
            case 'comentarios':
                estadoValidacion.comentarios = true;
                actualizarContadorComentarios(valor.length);
                break;
        }

        actualizarProgreso();
        actualizarBotonEnvio();
    }

    function validarNombresApellidos(valor, tipo) {
        const palabras = valor.trim().split(/\s+/).filter(p => p.length > 0);
        const regex = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ']+$/;

        if (palabras.length < 2) {
            mostrarError(`error${tipo}`, `Debe ingresar dos ${tipo.toLowerCase()} separados por espacio`);
            return false;
        }
        if (palabras.length > 2) {
            mostrarError(`error${tipo}`, `Solo debe ingresar dos ${tipo.toLowerCase()}`);
            return false;
        }
        for (let i = 0; i < palabras.length; i++) {
            if (!regex.test(palabras[i])) {
                mostrarError(`error${tipo}`, `El ${tipo.toLowerCase()} contiene caracteres inválidos`);
                return false;
            }
            if (palabras[i].length < 2) {
                mostrarError(`error${tipo}`, `Cada ${tipo.toLowerCase()} debe tener al menos 2 letras`);
                return false;
            }
        }
        mostrarExito(`exito${tipo}`, `✓ ${tipo} válidos`);
        return true;
    }

    function validarCorreo(valor) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(valor)) {
            mostrarError('errorCorreo', 'Formato de email inválido (ejemplo: usuario@dominio.com)');
            return false;
        }
        mostrarExito('exitoCorreo', '✓ Correo válido');
        return true;
    }

    function validarConfirmacionCorreo(valor) {
        const correoOriginal = document.getElementById('correo').value;
        if (valor !== correoOriginal) {
            mostrarError('errorConfirmarCorreo', 'Los correos no coinciden');
            return false;
        }
        mostrarExito('exitoConfirmarCorreo', '✓ Correos coinciden');
        return true;
    }

    function validarPassword(valor) {
        const fortaleza = calcularFortalezaPassword(valor);
        actualizarBarraFortaleza(fortaleza);

        if (valor.length < 8) {
            mostrarError('errorPassword', 'La contraseña debe tener al menos 8 caracteres');
            return false;
        } else if (fortaleza.nivel < 2) {
            mostrarError('errorPassword', 'Contraseña débil. Añade mayúsculas, números o símbolos');
            return false;
        }
        mostrarExito('exitoPassword', `✓ Contraseña ${fortaleza.texto}`);
        return true;
    }

    function validarConfirmacionPassword(valor) {
        const password = document.getElementById('password').value;
        if (valor !== password) {
            mostrarError('errorConfirmarPassword', 'Las contraseñas no coinciden');
            return false;
        } else if (valor.length > 0) {
            mostrarExito('exitoConfirmarPassword', '✓ Contraseñas coinciden');
            return true;
        }
        return false;
    }

    function validarTelefono(campo) {
        const valor = campo.value;
        let valorLimpio = valor.replace(/\D/g, '');

        if (valorLimpio.length > 3 && valorLimpio.length <= 6) {
            valorLimpio = valorLimpio.substring(0, 3) + '-' + valorLimpio.substring(3);
        } else if (valorLimpio.length > 6) {
            valorLimpio = valorLimpio.substring(0, 3) + '-' + valorLimpio.substring(3, 6) + '-' + valorLimpio.substring(6, 10);
        }

        campo.value = valorLimpio;

        const telefonoRegex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
        if (!telefonoRegex.test(valorLimpio)) {
            mostrarError('errorTelefono', 'Formato: 300-123-4567');
            return false;
        }
        mostrarExito('exitoTelefono', '✓ Teléfono válido');
        return true;
    }

    function validarFechaNacimiento(valor) {
        if (!valor) {
            mostrarError('errorFechaNacimiento', 'Selecciona una fecha de nacimiento');
            return false;
        }

        const fechaNacimiento = new Date(valor);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

        const mes = hoy.getMonth() - fechaNacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }

        if (edad < 18) {
            mostrarError('errorFechaNacimiento', 'Debes ser mayor de 18 años');
            return false;
        } else if (edad > 100) {
            mostrarError('errorFechaNacimiento', 'Fecha no válida');
            return false;
        }
        mostrarExito('exitoFechaNacimiento', `✓ Edad: ${edad} años`);
        return true;
    }

    function actualizarContadorComentarios(longitud) {
        const contador = document.getElementById('contadorComentarios');
        contador.textContent = `${longitud}/500`;
    }

    function mostrarError(idElemento, mensaje) {
        const elemento = document.getElementById(idElemento);
        if (elemento) {
            elemento.textContent = mensaje;
            elemento.style.display = 'block';
            ocultarMensaje(idElemento.replace('error', 'exito'));
        }
    }

    function mostrarExito(idElemento, mensaje) {
        const elemento = document.getElementById(idElemento);
        if (elemento) {
            elemento.textContent = mensaje;
            elemento.style.display = 'block';
            ocultarMensaje(idElemento.replace('exito', 'error'));
        }
    }

    function ocultarMensaje(idElemento) {
        const elemento = document.getElementById(idElemento);
        if (elemento) elemento.style.display = 'none';
    }

    function marcarCampo(campo, esValido) {
        if (esValido) {
            campo.classList.remove('invalido');
            campo.classList.add('valido');
        } else {
            campo.classList.remove('valido');
            campo.classList.add('invalido');
        }
    }

    function calcularFortalezaPassword(password) {
        let puntos = 0;
        const niveles = ['muy débil', 'débil', 'media', 'fuerte', 'muy fuerte'];

        if (password.length >= 8) puntos++;
        if (password.length >= 12) puntos++;
        if (/[a-z]/.test(password)) puntos++;
        if (/[A-Z]/.test(password)) puntos++;
        if (/[0-9]/.test(password)) puntos++;
        if (/[^A-Za-z0-9]/.test(password)) puntos++;

        const nivel = Math.min(Math.floor(puntos / 1.2), niveles.length - 1);

        return {
            nivel: nivel,
            texto: niveles[nivel]
        };
    }

    function actualizarBarraFortaleza(fortaleza) {
        const barra = document.getElementById('barraFortaleza');
        if (barra) {
            barra.value = fortaleza.nivel + 1;
            barra.title = fortaleza.texto;
        }
    }

    function actualizarProgreso() {
        const progreso = document.getElementById('progresoFormulario');
        if (progreso) {
            const totalCampos = Object.keys(estadoValidacion).length;
            const camposValidos = Object.values(estadoValidacion).filter(Boolean).length;
            progreso.value = (camposValidos / totalCampos) * 100;
        }
    }

    function actualizarBotonEnvio() {
        const todosValidos = Object.values(estadoValidacion).every(Boolean);
        btnEnviar.disabled = !todosValidos;
    }
});
