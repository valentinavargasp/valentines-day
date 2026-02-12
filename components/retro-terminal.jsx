"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"

// Sonidos retro (Web Audio API, sintéticos)
function getAudioContext() {
  if (typeof window === "undefined") return null
  if (!window.__retroTerminalAudioContext) {
    window.__retroTerminalAudioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return window.__retroTerminalAudioContext
}

function playKeyClick() {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === "suspended") ctx.resume()
  const now = ctx.currentTime
  const dur = 0.025
  const bufSize = Math.ceil(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.2))
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buf
  const gn = ctx.createGain()
  gn.gain.setValueAtTime(0.15, now)
  gn.gain.exponentialRampToValueAtTime(0.001, now + dur)
  noise.connect(gn)
  gn.connect(ctx.destination)
  noise.start(now)
  noise.stop(now + dur)
  const osc = ctx.createOscillator()
  const go = ctx.createGain()
  osc.connect(go)
  go.connect(ctx.destination)
  osc.type = "sine"
  osc.frequency.setValueAtTime(2800, now)
  go.gain.setValueAtTime(0.04, now)
  go.gain.exponentialRampToValueAtTime(0.001, now + 0.015)
  osc.start(now)
  osc.stop(now + 0.015)
}

function playGlitchSound() {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === "suspended") ctx.resume()
  const now = ctx.currentTime
  const bufferSize = ctx.sampleRate * 0.15
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  noise.connect(gain)
  gain.connect(ctx.destination)
  noise.start(now)
  noise.stop(now + 0.15)
  for (let f of [200, 400, 800]) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.connect(g)
    g.connect(ctx.destination)
    osc.type = "square"
    osc.frequency.setValueAtTime(f + (Math.random() * 200 - 100), now)
    g.gain.setValueAtTime(0.03, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    osc.start(now)
    osc.stop(now + 0.08)
  }
}

// Virtual File System
const FILE_SYSTEM = {
  "/": {
    type: "dir",
    children: ["root", "home", "etc", "var", "tmp"],
  },
  "/root": {
    type: "dir",
    children: [".hint", ".bash_history", "evidencias", "notas.txt"],
  },
  "/root/.hint": {
    type: "file",
    hidden: true,
    content: `[PISTA CLASIFICADA]
    
A veces lo que buscamos esta en los bits mas profundos de una imagen.
Los secretos se esconden donde menos lo esperas...

Revisa la carpeta 'evidencias'. Hay algo que necesitas extraer.

Tip: Un buen hacker sabe que las imagenes pueden contener mas de lo que se ve.
    Usa tus herramientas de esteganografia.`,
  },
  "/root/.bash_history": {
    type: "file",
    hidden: true,
    content: `cd /home/sergio/privado
cat regalo.enc
openssl aes-256-cbc -d -in regalo.enc
su sergio
whoami
ls -la`,
  },
  "/root/notas.txt": {
    type: "file",
    content: `=== NOTAS DE INVESTIGACION ===
Fecha: 14 de Febrero 2026

He detectado actividad sospechosa en el sistema.
Parece que alguien ha dejado mensajes ocultos...

El usuario 'sergio' tiene una carpeta privada protegida.
Necesito encontrar la contrasena para acceder.

Pista encontrada: La contrasena podria estar oculta
en algun archivo de imagen. Debo investigar mas.

- root`,
  },
  "/root/evidencias": {
    type: "dir",
    children: ["imagen_misteriosa.png", "logs_2022.txt", "readme.txt"],
  },
  "/root/evidencias/readme.txt": {
    type: "file",
    content: `=== ARCHIVO DE EVIDENCIAS ===

Esta carpeta contiene archivos recuperados de una
investigacion de seguridad muy especial.

PASO 1: Descarga la imagen (comando: download imagen_misteriosa.png)

PASO 2: Decodificala en tu navegador en:
  https://stylesuxx.github.io/steganography/
  (Decode -> elige la imagen descargada -> Decode)

PASO 3: Sigue las instrucciones que obtengas al decodificar.`,
  },
  "/root/evidencias/logs_2022.txt": {
    type: "file",
    content: `=== SYSTEM LOGS 2022 ===

[17 Nov 2022] - Usuario 'vicente' agregado al sistema con exito.
               Rol: hijo_menor | Permisos: amor_infinito
               
[27 Nov 2021] - Conexion establecida: Sergio <-> Valentina
               Estado: PERMANENTE
               
[23 Jun 2017] - Usuario 'camilo' agregado al sistema.
               Rol: hijo_mayor | Permisos: amor_infinito
               
[23 Jun 2017] - Primera conexion detectada.
               Usuario 'sergio' y usuario 'valentina' sincronizados.
               Protocolo: AMOR_ETERNO iniciado.

[NOTA]: Todos los usuarios del sistema familiar tienen
        permisos de nivel MAXIMO en el corazon.`,
  },
  "/root/evidencias/imagen_misteriosa.png": {
    type: "image",
    url: "/amor.png",
    steghidePassword: "amor",
    hiddenContent: "amor2026",
  },
  "/home": {
    type: "dir",
    children: ["sergio", "guest"],
  },
  "/home/sergio": {
    type: "dir",
    children: ["privado", ".profile", "bienvenida.txt"],
  },
  "/home/sergio/.profile": {
    type: "file",
    hidden: true,
    content: `# Perfil de Sergio
export USER="sergio"
export ROLE="mejor_papa_del_mundo"
export LOVE_LEVEL="infinito"
echo "Bienvenido, mi amor <3"`,
  },
  "/home/sergio/bienvenida.txt": {
    type: "file",
    content: `Hola Sergio!

Si estas leyendo esto, significa que has llegado lejos.
Pero tu mision aun no termina...

Tu carpeta 'privado' contiene algo especial.
Necesitaras la contrasena correcta para acceder.

Pista: La contrasena es un recuerdo muy especial...
      Oh Dago, llegaste a mi vida volandoooo...  ;)

Con amor,
SuperAdmin`,
  },
  "/home/sergio/privado": {
    type: "dir",
    protected: true,
    password: "dagoberto",
    children: ["regalo.enc", "instrucciones.txt"],
  },
  "/home/sergio/privado/instrucciones.txt": {
    type: "file",
    content: `=== INSTRUCCIONES FINALES ===

Felicidades por llegar hasta aqui!

El archivo 'regalo.enc' esta encriptado.
Para desencriptarlo, usa:

  openssl aes-256-cbc -d -in regalo.enc

o

  gpg --decrypt regalo.enc

La contrasena final es una fecha muy especial... formato DDMMAAAA

Suerte, mi hacker favorito <3`,
  },
  "/home/sergio/privado/regalo.enc": {
    type: "encrypted",
    password: "23062017",
    content: `
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ██╗   ██╗ █████╗ ██╗     ███████╗███╗   ██╗████████╗██╗███╗   ██║
║   ██║   ██║██╔══██╗██║     ██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║
║   ██║   ██║███████║██║     █████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║
║   ╚██╗ ██╔╝██╔══██║██║     ██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║
║    ╚████╔╝ ██║  ██║███████╗███████╗██║ ╚████║   ██║   ██║██║ ╚████║
║     ╚═══╝  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝
║                                                                   ║
║   ███████╗██╗      █████╗  ██████╗                                ║
║   ██╔════╝██║     ██╔══██╗██╔════╝                                ║
║   █████╗  ██║     ███████║██║  ███╗                               ║
║   ██╔══╝  ██║     ██╔══██║██║   ██║                               ║
║   ██║     ███████╗██║  ██║╚██████╔╝                               ║
║   ╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝                                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║   Happy Valentine's Day! VALENTINE{SERGIO_DOS_REGALOS_TE_ESPERAN} ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║   Felicidades, mi hacker favorito!                                ║
║                                                                   ║
║   Has completado el CTF del amor. Hay DOS regalos para vos <3     ║
║                                                                   ║                                                                                              ║
║                                                                   ║
║   Gracias por ser el mejor compañero de vida,                     ║
║   el mejor papá para Camilo y Vicente,                            ║
║   y por impulsar siempre mis sueños.                              ║
║   Hoy queremos mimarte a vos <3                                   ║
║                                                                   ║
║   Te amo infinitamente,                                           ║
║   SuperAdmin <3                                                   ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`,
  },
  "/home/guest": {
    type: "dir",
    children: ["welcome.txt"],
  },
  "/home/guest/welcome.txt": {
    type: "file",
    content: "Acceso denegado. Este sistema es solo para usuarios autorizados.",
  },
  "/etc": {
    type: "dir",
    children: ["passwd", "shadow", "hosts"],
  },
  "/etc/passwd": {
    type: "file",
    content: `root:x:0:0:root:/root:/bin/bash
sergio:x:1000:1000:Sergio el Magnifico:/home/sergio:/bin/bash
camilo:x:1001:1001:Explorador Oficial:/home/camilo:/bin/bash
vicente:x:1002:1002:Bebe del Sistema:/home/vicente:/bin/bash
amor:x:1003:1003:Amor Eterno:/home/amor:/bin/bash`,
  },
  "/etc/shadow": {
    type: "file",
    content: "[ACCESO DENEGADO] - Este archivo contiene hashes de contrasenas.",
  },
  "/etc/hosts": {
    type: "file",
    content: `127.0.0.1       localhost
127.0.0.1       kali-love
192.168.1.100   corazon.local
192.168.1.101   italia.amor.net
192.168.1.102   familia.forever`,
  },
  "/var": {
    type: "dir",
    children: ["log"],
  },
  "/var/log": {
    type: "dir",
    children: ["auth.log", "amor.log"],
  },
  "/var/log/auth.log": {
    type: "file",
    content: `[INFO] Usuario sergio autenticado con exito
[INFO] Sesion de amor iniciada
[WARNING] Niveles de ternura excedidos
[INFO] Sistema familiar operando normalmente`,
  },
  "/var/log/amor.log": {
    type: "file",
    content: `=== LOG DE AMOR ===
2015-02-14: Primera conexion establecida
2018-03-15: Migracion a Italia completada
2020-03-03: Nuevo nodo 'Camilo' agregado a la red
2022-11-17: Nuevo nodo 'Vicente' agregado a la red
2026-02-14: CTF del amor iniciado <3`,
  },
  "/tmp": {
    type: "dir",
    children: [".secret_note"],
  },
  "/tmp/.secret_note": {
    type: "file",
    hidden: true,
    content: `Nota secreta:

Si encontraste esto, eres muy curioso ;)

Pista extra: La fecha en que nos conocimos
abre muchas puertas... formato DDMMAAAA`,
  },
}

const HELP_TEXT = `
Comandos disponibles:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAVEGACION:
  ls [opciones]      Lista archivos y directorios
                     -l    formato largo
                     -a    muestra archivos ocultos
                     -la   ambos
  cd <directorio>    Cambia de directorio
                     cd ..  sube un nivel
                     cd ~   va a /root
                     cd /   va a la raiz
  pwd                Muestra el directorio actual
  cat <archivo>      Muestra el contenido de un archivo

SISTEMA:
  whoami             Muestra el usuario actual
  clear              Limpia la pantalla
  help               Muestra esta ayuda

HERRAMIENTAS DE SEGURIDAD:
  su <usuario>       Cambia de usuario (requiere contrasena)
  steghide extract -sf <imagen>
                     Extrae datos ocultos de una imagen
  openssl aes-256-cbc -d -in <archivo>
                     Desencripta un archivo
  gpg --decrypt <archivo>
                     Desencripta un archivo con GPG
  curl -O <url>      Descarga un archivo (ej: curl -O imagen_misteriosa.png)
  wget <url>         Descarga un archivo
  download <archivo> Descarga la imagen para analizarla en tu maquina (ej: download imagen_misteriosa.png)
  start --valentines Muestra un mensaje de San Valentin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tip: Empieza explorando con 'ls -la' para ver archivos ocultos.
     
`

const BOLSO_IMAGE_URL = "/2.png"
const MENU_IMAGE_URL = "/1.png"

export default function RetroTerminal({ onClose }) {
  const [history, setHistory] = useState([
    {
      type: "output",
      content: `
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ██╗  ██╗ █████╗ ██╗     ██╗    ██╗      ██████╗ ██╗   ██╗███████│
│  ██║ ██╔╝██╔══██╗██║     ██║    ██║     ██╔═══██╗██║   ██║██╔════│
│  █████╔╝ ███████║██║     ██║    ██║     ██║   ██║██║   ██║█████╗ │
│  ██╔═██╗ ██╔══██║██║     ██║    ██║     ██║   ██║╚██╗ ██╔╝██╔══╝ │
│  ██║  ██╗██║  ██║███████╗██║    ███████╗╚██████╔╝ ╚████╔╝ ███████│
│  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝    ╚══════╝ ╚═════╝   ╚═══╝  ╚══════│
│                                                                  │
│   Sistema: Kali Love Edition 2026                                │
│   Mision: CTF de San Valentin                                    │
│   Objetivo: Encuentra el FLAG oculto                             │
│                                                                  │
│   Escribe 'help' para ver los comandos disponibles.              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
`,
    },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [currentPath, setCurrentPath] = useState("/root")
  const [currentUser, setCurrentUser] = useState("root")
  const [isGlitching, setIsGlitching] = useState(false)
  const [awaitingPassword, setAwaitingPassword] = useState(null)
  const [unlockedPaths, setUnlockedPaths] = useState([])
  const [showRewards, setShowRewards] = useState(false)
  const [hackPhase, setHackPhase] = useState("idle") // idle | glitch_fullscreen | blink | done
  const [glitchFullscreenText, setGlitchFullscreenText] = useState("")
  const pendingFlagContentRef = useRef(null)
  const inputRef = useRef(null)
  const historyRef = useRef(null)

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [history])

  useEffect(() => {
    const focusInput = () => {
      inputRef.current?.focus()
    }
    focusInput()
    document.addEventListener("click", focusInput)
    return () => document.removeEventListener("click", focusInput)
  }, [])

  useEffect(() => {
    if (hackPhase !== "glitch_fullscreen") return
    playGlitchSound()
    const chars = "01"
    const interval = setInterval(() => {
      setGlitchFullscreenText(
        Array(60)
          .fill(0)
          .map(() =>
            Array(200)
              .fill(0)
              .map(() => chars[Math.floor(Math.random() * 2)])
              .join("")
          )
          .join("\n")
      )
    }, 45)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setHackPhase("blink")
    }, 2000)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [hackPhase])

  useEffect(() => {
    if (hackPhase !== "blink") return
    const t = setTimeout(() => {
      setHackPhase("done")
      setHistory((prev) => {
        const withoutDecrypting = prev.slice(0, -1)
        const flagContent = pendingFlagContentRef.current
        return flagContent ? [...withoutDecrypting, { type: "output", content: flagContent }] : withoutDecrypting
      })
      setShowRewards(true)
    }, 350)
    return () => clearTimeout(t)
  }, [hackPhase])

  useEffect(() => {
    if (hackPhase === "idle" || hackPhase === "glitch_fullscreen") return
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [hackPhase, history, showRewards])

  useEffect(() => {
    if (hackPhase !== "idle") return
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        setIsGlitching(true)
        setTimeout(() => setIsGlitching(false), 100)
      }
    }, 4000)
    return () => clearInterval(glitchInterval)
  }, [hackPhase])

  const resolvePath = (path) => {
    if (path.startsWith("/")) return path
    if (path === "~") return "/root"
    if (path === "..") {
      const parts = currentPath.split("/").filter(Boolean)
      parts.pop()
      return "/" + parts.join("/") || "/"
    }
    if (path === ".") return currentPath
    return currentPath === "/" ? `/${path}` : `${currentPath}/${path}`
  }

  const getPrompt = () => {
    const displayPath = currentPath === "/root" ? "~" : currentPath
    return `${currentUser}@kali-love:${displayPath}#`
  }

  const processCommand = useCallback(
    (cmd) => {
      const trimmedCmd = cmd.trim()
      const parts = trimmedCmd.split(/\s+/)
      const command = parts[0]?.toLowerCase()
      const args = parts.slice(1)

      const addToHistory = (output, isCommand = true) => {
        if (isCommand) {
          setHistory((prev) => [
            ...prev,
            { type: "command", content: cmd },
            { type: "output", content: output },
          ])
        } else {
          setHistory((prev) => [...prev, { type: "output", content: output }])
        }
      }

      // Handle password input
      if (awaitingPassword) {
        const { type, target, expectedPassword } = awaitingPassword
        setAwaitingPassword(null)

        if (trimmedCmd === expectedPassword) {
          if (type === "su") {
            setCurrentUser("sergio")
            setCurrentPath("/home/sergio")
            addToHistory(`Autenticacion exitosa. Bienvenido, sergio.`, false)
          } else if (type === "cd") {
            setUnlockedPaths((prev) => [...prev, target])
            setCurrentPath(target)
            addToHistory(`Acceso concedido a ${target}`, false)
          } else if (type === "steghide") {
            addToHistory(
              `Extrayendo datos de la imagen...
              
[+] Archivo de salida: "password.txt"
[+] Contenido extraido:

═══════════════════════════════════════
  CONTRASENA ENCONTRADA: dagoberto
  
  Usa esta contrasena para acceder a:
  /home/sergio/privado
═══════════════════════════════════════`,
              false
            )
          } else if (type === "decrypt") {
            const file = FILE_SYSTEM[target]
            if (file && file.content) {
              setHistory((prev) => [
                ...prev,
                { type: "command", content: cmd },
                { type: "output", content: "Decrypting...\n" },
              ])
              pendingFlagContentRef.current = file.content
              setHackPhase("glitch_fullscreen")
            }
          }
        } else {
          addToHistory(`Contrasena incorrecta.`, false)
        }
        return
      }

      if (trimmedCmd === "") {
        setHistory((prev) => [...prev, { type: "command", content: "" }])
        return
      }

      switch (command) {
        case "help":
          addToHistory(HELP_TEXT)
          break

        case "whoami":
          addToHistory(currentUser)
          break

        case "pwd":
          addToHistory(currentPath)
          break

        case "clear":
          setHistory([])
          return

        case "start": {
          if (args[0] === "--valentines") {
            setHistory([
              {
                type: "output",
                content: `
    ***   ***
   ***** *****
  ***********
  ***********
   *********
    *******
     *****
      ***
       *

  ¡Feliz San Valentin, mi amor! <3
`,
              },
            ])
            return
          }
          addToHistory(`bash: ${command}: comando no encontrado. Prueba 'start --valentines' ;)`)
          break
        }

        case "ls": {
          const showHidden = args.includes("-a") || args.includes("-la") || args.includes("-al")
          const longFormat = args.includes("-l") || args.includes("-la") || args.includes("-al")
          const targetPath = args.find((a) => !a.startsWith("-")) || currentPath
          const resolvedPath = resolvePath(targetPath)
          const dir = FILE_SYSTEM[resolvedPath]

          if (!dir || dir.type !== "dir") {
            addToHistory(`ls: no se puede acceder a '${targetPath}': No es un directorio`)
            break
          }

          let files = dir.children || []
          if (!showHidden) {
            files = files.filter((f) => !f.startsWith("."))
          }

          if (longFormat) {
            const output = files
              .map((f) => {
                const fullPath = resolvedPath === "/" ? `/${f}` : `${resolvedPath}/${f}`
                const fileObj = FILE_SYSTEM[fullPath]
                const isDir = fileObj?.type === "dir"
                const isHidden = f.startsWith(".")
                const perms = isDir ? "drwxr-xr-x" : "-rw-r--r--"
                const size = fileObj?.content?.length || 4096
                const color = isDir ? "text-blue-400" : isHidden ? "text-red-400" : "text-green-300"
                return `<span class="${color}">${perms}  1 root root  ${String(size).padStart(5)}  Feb 14  ${f}</span>`
              })
              .join("\n")
            addToHistory(`total ${files.length}\n${output}`)
          } else {
            const output = files
              .map((f) => {
                const fullPath = resolvedPath === "/" ? `/${f}` : `${resolvedPath}/${f}`
                const fileObj = FILE_SYSTEM[fullPath]
                const isDir = fileObj?.type === "dir"
                const isHidden = f.startsWith(".")
                if (isDir) return `\x1b[34m${f}\x1b[0m`
                if (isHidden) return `\x1b[31m${f}\x1b[0m`
                return f
              })
              .join("  ")
            addToHistory(output)
          }
          break
        }

        case "cd": {
          const target = args[0] || "~"
          const resolvedPath = resolvePath(target)
          const dir = FILE_SYSTEM[resolvedPath]

          if (!dir) {
            addToHistory(`cd: ${target}: No existe el directorio`)
            break
          }
          if (dir.type !== "dir") {
            addToHistory(`cd: ${target}: No es un directorio`)
            break
          }
          if (dir.protected && !unlockedPaths.includes(resolvedPath)) {
            addToHistory(`Password:`)
            setAwaitingPassword({
              type: "cd",
              target: resolvedPath,
              expectedPassword: dir.password,
            })
            break
          }
          setCurrentPath(resolvedPath)
          break
        }

        case "cat": {
          const target = args[0]
          if (!target) {
            addToHistory(`cat: falta el operando`)
            break
          }
          const resolvedPath = resolvePath(target)
          const file = FILE_SYSTEM[resolvedPath]

          if (!file) {
            addToHistory(`cat: ${target}: No existe el archivo`)
            break
          }
          if (file.type === "dir") {
            addToHistory(`cat: ${target}: Es un directorio`)
            break
          }
          if (file.type === "image") {
            addToHistory(
              `cat: ${target}: Es un archivo binario (imagen)\n\nDescargala con: download imagen_misteriosa.png\nLuego decodificala en: https://stylesuxx.github.io/steganography/ (Decode) y sigue las instrucciones.`
            )
            break
          }
          if (file.type === "encrypted") {
            addToHistory(
              `cat: ${target}: Archivo encriptado\n\nUsa 'openssl aes-256-cbc -d -in ${target}' o 'gpg --decrypt ${target}' para desencriptar.`
            )
            break
          }
          addToHistory(file.content)
          break
        }

        case "su": {
          const targetUser = args[0]
          if (!targetUser) {
            addToHistory(`su: debe especificar un usuario`)
            break
          }
          if (targetUser !== "sergio") {
            addToHistory(`su: usuario '${targetUser}' no existe`)
            break
          }
          addToHistory(`Password:`)
          setAwaitingPassword({
            type: "su",
            target: targetUser,
            expectedPassword: "dagoberto",
          })
          break
        }

        case "steghide": {
          if (args[0] === "extract" && args[1] === "-sf") {
            const imageName = args[2]
            if (!imageName) {
              addToHistory(`steghide: falta el archivo de imagen`)
              break
            }
            const resolvedPath = resolvePath(imageName)
            const file = FILE_SYSTEM[resolvedPath]
            if (!file || file.type !== "image") {
              addToHistory(`steghide: '${imageName}' no es una imagen valida`)
              break
            }
            addToHistory(`Enter passphrase:`)
            setAwaitingPassword({
              type: "steghide",
              target: resolvedPath,
              expectedPassword: file.steghidePassword,
            })
          } else {
            addToHistory(`steghide: uso: steghide extract -sf <archivo>`)
          }
          break
        }

        case "openssl": {
          if (args.includes("aes-256-cbc") && args.includes("-d") && args.includes("-in")) {
            const inIndex = args.indexOf("-in")
            const fileName = args[inIndex + 1]
            if (!fileName) {
              addToHistory(`openssl: falta el archivo de entrada`)
              break
            }
            const resolvedPath = resolvePath(fileName)
            const file = FILE_SYSTEM[resolvedPath]
            if (!file || file.type !== "encrypted") {
              addToHistory(
                !file
                  ? `openssl: '${fileName}' no existe en esta ruta.\n(Asegurate de estar en la carpeta privado: cd privado)`
                  : `openssl: '${fileName}' no es un archivo encriptado`
              )
              break
            }
            addToHistory(`enter AES-256-CBC decryption password:`)
            setAwaitingPassword({
              type: "decrypt",
              target: resolvedPath,
              expectedPassword: file.password,
            })
          } else {
            addToHistory(`openssl: uso: openssl aes-256-cbc -d -in <archivo>`)
          }
          break
        }

        case "gpg": {
          if (args[0] === "--decrypt") {
            const fileName = args[1]
            if (!fileName) {
              addToHistory(`gpg: falta el archivo`)
              break
            }
            const resolvedPath = resolvePath(fileName)
            const file = FILE_SYSTEM[resolvedPath]
            if (!file || file.type !== "encrypted") {
              addToHistory(
                !file
                  ? `gpg: '${fileName}' no existe en esta ruta.\n(Asegurate de estar en la carpeta privado: cd privado)`
                  : `gpg: '${fileName}' no es un archivo encriptado`
              )
              break
            }
            addToHistory(`Enter passphrase:`)
            setAwaitingPassword({
              type: "decrypt",
              target: resolvedPath,
              expectedPassword: file.password,
            })
          } else {
            addToHistory(`gpg: uso: gpg --decrypt <archivo>`)
          }
          break
        }

        case "curl":
        case "wget": {
          const urlArg = args.find((a) => a.startsWith("http") || (a !== "-O" && a !== "-o" && !a.startsWith("-")))
          const imageFile = FILE_SYSTEM["/root/evidencias/imagen_misteriosa.png"]
          const isRequestingImage = urlArg && (urlArg.includes("imagen_misteriosa") || urlArg.includes("evidencias") || (imageFile && !urlArg.startsWith("http")))
          if (urlArg && (urlArg.startsWith("http") || isRequestingImage)) {
            if (imageFile && imageFile.url) {
              const downloadUrl = typeof window !== "undefined" ? window.location.origin + imageFile.url : imageFile.url
              const a = document.createElement("a")
              a.href = downloadUrl
              a.download = "imagen_misteriosa.png"
              a.rel = "noopener noreferrer"
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              addToHistory(
                `Descargando imagen_misteriosa.png...\nArchivo guardado. Analizala con steghide u otras herramientas en tu maquina.`
              )
            } else {
              addToHistory(`${command}: no se pudo conectar`)
            }
          } else if (!urlArg) {
            addToHistory(`${command}: uso: ${command} -O <url> o ${command} imagen_misteriosa.png para descargar la imagen`)
          } else {
            addToHistory(`${command}: no se pudo conectar (usa la URL del servidor o 'download imagen_misteriosa.png')`)
          }
          break
        }

        case "download": {
          const fileArg = args[0]
          const imageFile = FILE_SYSTEM["/root/evidencias/imagen_misteriosa.png"]
          const requestingImage = !fileArg || fileArg === "imagen_misteriosa.png" || fileArg === "evidencias/imagen_misteriosa.png"
          if (imageFile && imageFile.url && requestingImage) {
            const downloadUrl = typeof window !== "undefined" ? window.location.origin + imageFile.url : imageFile.url
            const a = document.createElement("a")
            a.href = downloadUrl
            a.download = "imagen_misteriosa.png"
            a.rel = "noopener noreferrer"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            addToHistory(`Descargando imagen_misteriosa.png... Listo. Analizala externamente con steghide.`)
          } else if (fileArg && fileArg !== "imagen_misteriosa.png") {
            addToHistory(`download: solo esta disponible 'imagen_misteriosa.png' (estas en evidencias)`)
          } else {
            addToHistory(`download: uso: download imagen_misteriosa.png`)
          }
          break
        }

        default:
          addToHistory(`bash: ${command}: comando no encontrado\nEscribe 'help' para ver los comandos disponibles.`)
      }
    },
    [currentPath, currentUser, awaitingPassword, unlockedPaths]
  )

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      processCommand(currentInput)
      setCurrentInput("")
      return
    }
    if ((hackPhase === "idle" || hackPhase === "done") && !e.ctrlKey && !e.metaKey && !e.altKey) {
      playKeyClick()
    }
  }

  const fullscreenOverlay = (() => {
    if (typeof document === "undefined") return null
    if (hackPhase === "glitch_fullscreen") {
      return createPortal(
        <div
          className="fixed inset-0 z-[9998] bg-black overflow-hidden"
          style={{ top: 0, left: 0, width: "100vw", height: "100vh", minWidth: "100%", minHeight: "100%" }}
          aria-hidden
        >
          <pre
            className="absolute inset-0 w-full h-full font-mono text-[#2ecc71] select-none whitespace-pre-wrap break-all m-0 p-3 box-border"
            style={{
              fontSize: "clamp(6px, 1.2vw, 10px)",
              lineHeight: 1.1,
              textShadow: "0 0 8px rgba(46, 204, 113, 0.9)",
            }}
          >
            {glitchFullscreenText || "[010101...]"}
          </pre>
        </div>,
        document.body
      )
    }
    if (hackPhase === "blink") {
      return createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-white"
          style={{ top: 0, left: 0, width: "100vw", height: "100vh", animation: "flash 200ms ease-out" }}
          aria-hidden
        />,
        document.body
      )
    }
    if (showRewards) {
      return createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col items-center justify-center p-6 overflow-y-auto" style={{ top: 0, left: 0, width: "100vw", height: "100vh" }}>
          <button
            type="button"
            onClick={() => setShowRewards(false)}
            className="absolute top-4 right-4 z-10 font-mono text-sm text-[#2ecc71] border border-[#2ecc71]/60 px-4 py-2 rounded bg-black/80 hover:bg-[#2ecc71]/10 hover:border-[#2ecc71] transition-all cursor-pointer shadow-[0_0_12px_rgba(46,204,113,0.2)]"
            aria-label="Volver a la terminal"
          >
            [ Volver ]
          </button>
          <div className="flex flex-wrap justify-center items-start gap-8 mt-10 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl overflow-hidden border-2 border-[#2ecc71]/50 shadow-[0_0_25px_rgba(46,204,113,0.4)] bg-black/80 flex flex-col w-fit max-w-[95vw]"
            >
              <div className="p-5 flex flex-col">
                <h3 className="text-[#2ecc71] font-bold text-xl mb-3">Regalo agarrá la pala</h3>
                <div className="rounded-lg overflow-hidden mb-4 border border-[#2ecc71]/30 shadow-[0_0_15px_rgba(46,204,113,0.2)] bg-zinc-900/50 flex items-center justify-center min-h-[220px] min-w-[200px]">
                  <img
                    src={BOLSO_IMAGE_URL}
                    alt="Bolso y billetera"
                    className="max-h-[50vh] max-w-full w-auto h-auto object-contain"
                    style={{ filter: "contrast(1.05) saturate(0.95) sepia(0.03)" }}
                  />
                </div>
                <p className="text-[#2ecc71]/90 text-sm max-w-[280px]">
                  Tu regalito <strong className="text-[#2ecc71]">está por llegar</strong>. Portfolio y billetera matcheando, listo para una nueva etapa en nivel superior.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl overflow-hidden border-2 border-[#2ecc71]/50 shadow-[0_0_25px_rgba(46,204,113,0.4)] bg-black/80 flex flex-col w-fit max-w-[95vw]"
            >
              <div className="p-5 flex flex-col">
                <h3 className="text-[#2ecc71] font-bold text-xl mb-3">Mision Mercure</h3>
                <div className="rounded-lg overflow-hidden mb-4 border border-[#2ecc71]/30 shadow-[0_0_15px_rgba(46,204,113,0.2)] bg-zinc-900/50 flex items-center justify-center min-h-[220px] min-w-[200px]">
                  <img
                    src={MENU_IMAGE_URL}
                    alt="Menu cena Mercure"
                    className="max-h-[50vh] max-w-full w-auto h-auto object-contain"
                    style={{ filter: "contrast(1.05) saturate(0.95) sepia(0.03)" }}
                  />
                </div>
                <p className="text-[#2ecc71]/90 text-sm max-w-[280px]">
                  Los detalles te los envío a tu <strong className="text-[#2ecc71]">whatsapp</strong>. Noche de cena, spa y alojamiento inspirada en la Toscana en el Hotel Mercure.
                </p>
              </div>
            </motion.div>
          </div>
        </div>,
        document.body
      )
    }
    return null
  })()

  return (
    <>
      {fullscreenOverlay}

      <div className="w-full font-mono h-full max-h-full flex flex-col min-h-0">
        {/* Terminal Window */}
        <div
        className={`relative bg-black rounded-lg overflow-hidden shadow-2xl border border-zinc-700 flex flex-col min-h-0 ${isGlitching ? "animate-glitch" : ""}`}
      >
        {/* Scanlines overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-20"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.4) 2px, rgba(0, 0, 0, 0.4) 4px)",
          }}
        />

        {/* Title Bar */}
        <div className="flex items-center justify-between bg-[#2d2d2d] px-3 py-2 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <rect x="2" y="3" width="20" height="18" rx="2" fill="transparent" stroke="#2ecc71" strokeWidth="1.5" />
              <path d="M6 8l4 4-4 4" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 16h6" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-zinc-300 text-sm">{currentUser}@kali-love: {currentPath}</span>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-600" />
            <div className="w-3 h-3 rounded-full bg-zinc-600" />
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer shrink-0"
                aria-label="Cerrar terminal"
              />
            ) : (
              <div className="w-3 h-3 rounded-full bg-red-500" />
            )}
          </div>
        </div>

        {/* Terminal Content */}
        <div
          ref={historyRef}
          onClick={() => inputRef.current?.focus()}
          className="min-h-[200px] max-h-[42vh] sm:max-h-[46vh] md:max-h-[52vh] lg:max-h-[56vh] xl:max-h-[60vh] 2xl:h-[500px] 2xl:max-h-[500px] overflow-y-auto overflow-x-hidden p-4 text-[#2ecc71] text-sm leading-relaxed cursor-text relative flex-1"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#2ecc71 transparent",
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            textShadow: "0 0 5px rgba(46, 204, 113, 0.5)",
          }}
        >
          {history.map((entry, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {entry.type === "command" ? (
                <div className="flex">
                  <span className="text-[#2ecc71]">{getPrompt()}</span>
                  <span className="ml-2">{entry.content}</span>
                </div>
              ) : (
                <div
                  className="text-[#2ecc71]/90"
                  dangerouslySetInnerHTML={{
                    __html: entry.content
                      .replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/\x1b\[34m/g, '<span class="text-blue-400">')
                      .replace(/\x1b\[31m/g, '<span class="text-red-400">')
                      .replace(/\x1b\[0m/g, "</span>"),
                  }}
                />
              )}
            </div>
          ))}

          {/* Current Input Line - oculto durante la secuencia de hack */}
          {(hackPhase === "idle" || hackPhase === "done") && (
            <div className="flex items-center">
              <span className="text-[#2ecc71]">{getPrompt()}</span>
              <span className="ml-2">{awaitingPassword ? "*".repeat(currentInput.length) : currentInput}</span>
              <span className="animate-blink ml-0.5 inline-block w-2 h-4 bg-[#2ecc71]" />
            </div>
          )}

          <input
            ref={inputRef}
            type={awaitingPassword ? "password" : "text"}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0 pointer-events-auto"
            autoFocus
            autoComplete="off"
            aria-label="Terminal input"
          />
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-glitch {
          animation: glitch 0.1s linear;
        }
        @keyframes flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
      </div>
    </>
  )
}
