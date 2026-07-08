<div align="center">

<img src="https://raw.githubusercontent.com/gabrielseffrin/front-expedisoft/main/public/logo.png" alt="ExpediSoft Logo" width="180"/>

# ExpediSoft — App Mobile

**Aplicativo de conferência operacional para carregamento de mercadorias**

[![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Android](https://img.shields.io/badge/Android-compatible-3DDC84?style=flat-square&logo=android&logoColor=white)](https://www.android.com/)
[![iOS](https://img.shields.io/badge/iOS-compatible-000000?style=flat-square&logo=apple&logoColor=white)](https://www.apple.com/ios/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Sobre](#-sobre) · [Telas](#-telas) · [Funcionalidades](#-funcionalidades) · [Tecnologias](#-tecnologias) · [Instalação](#-instalação) · [Repositórios](#-repositórios)

</div>

---

## 📱 Sobre

O **app-expedisoft** é o aplicativo mobile do ecossistema ExpediSoft, utilizado pelos **operadores logísticos** diretamente no chão de fábrica ou armazém. Substitui a conferência manual por um fluxo digital com leitura de QR Code, validação em tempo real e captura de evidências fotográficas — eliminando erros humanos de embarque.

> Desenvolvido como Trabalho de Conclusão de Curso na UTFPR Guarapuava (2026). Consome a [API Laravel](https://github.com/gabrielseffrin/back-expedisoft) e complementa a [plataforma web](https://github.com/gabrielseffrin/front-expedisoft) utilizada pelos gestores.

---

## 📸 Telas

<div align="center">

| Login | Home | Lista de Cargas |
|:---:|:---:|:---:|
| ![Login](https://raw.githubusercontent.com/gabrielseffrin/app-expedisoft/main/assets/images/screenshots/login.jpg) | ![Home](https://raw.githubusercontent.com/gabrielseffrin/app-expedisoft/main/assets/images/screenshots/home.jpg) | ![Lista](https://raw.githubusercontent.com/gabrielseffrin/app-expedisoft/main/assets/images/screenshots/list.jpg) |

| Detalhes da Ordem | Leitura QR Code (Sucesso) | Alerta de Inconsistência |
|:---:|:---:|:---:|
| ![Detalhes](https://raw.githubusercontent.com/gabrielseffrin/app-expedisoft/main/assets/images/screenshots/details.jpg) | ![Sucesso](https://raw.githubusercontent.com/gabrielseffrin/app-expedisoft/main/assets/images/screenshots/scan-success.jpg) | ![Erro](https://raw.githubusercontent.com/gabrielseffrin/app-expedisoft/main/assets/images/screenshots/scan-error.jpg) |

| Registro de Justificativa | Captura de Fotos |
|:---:|:---:|
| ![Justificativa](https://raw.githubusercontent.com/gabrielseffrin/app-expedisoft/main/assets/images/screenshots/justification.jpg) | ![Fotos](https://raw.githubusercontent.com/gabrielseffrin/app-expedisoft/main/assets/images/screenshots/photos.jpg) |

</div>

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Autenticação persistente** | Login com sessão ativa durante todo o turno — sem reautenticação a cada abertura |
| **Lista de carregamentos** | Visualização das ordens atribuídas com status, ID e horário agendado |
| **Checklist digital** | Barra de progresso da conferência com detalhe de cada caixa a embarcar |
| **Leitura de QR Code** | Câmera nativa para escanear etiquetas coladas nos volumes |
| **Validação em tempo real** | Feedback sonoro e visual imediato — sucesso, duplicata ou carga errada |
| **Bloqueio de divergências** | Finalização bloqueada quando há inconsistências; exige justificativa textual |
| **Captura de evidências** | Fotos da carga via câmera ou galeria, enviadas ao backend de forma assíncrona |

---

## 🔄 Fluxo Operacional

```
┌──────────────┐    ┌──────────────────┐    ┌──────────────────────────┐
│  Login no    │───►│  Lista de cargas │───►│  Abre ordem e inicia     │
│  aplicativo  │    │  atribuídas      │    │  conferência             │
└──────────────┘    └──────────────────┘    └───────────┬──────────────┘
                                                        │
                                            ┌───────────▼──────────────┐
                                            │  Escaneia QR Code        │
                                            │  de cada volume          │
                                            └───────────┬──────────────┘
                                                        │
                          ┌─────────────────────────────┼─────────────────────┐
                          │                             │                     │
                ┌─────────▼──────┐          ┌──────────▼───────┐   ┌─────────▼──────┐
                │  ✅ Sucesso    │          │  ❌ Duplicata /  │   │  ❌ Código não  │
                │  Item marcado  │          │  Embarque Cruzado│   │  pertence à    │
                │  no checklist  │          │  → Alerta de erro│   │  ordem → Erro  │
                └────────────────┘          └──────────────────┘   └────────────────┘
                                                        │
                                            ┌───────────▼──────────────┐
                                            │  Todos conferidos?        │
                                            │  → Finaliza com observação│
                                            │  Divergência?             │
                                            │  → Exige justificativa    │
                                            │  → Captura fotos          │
                                            └───────────┬──────────────┘
                                                        │
                                            ┌───────────▼──────────────┐
                                            │  Dados sincronizados com  │
                                            │  a plataforma web         │
                                            └──────────────────────────┘
```

---

## 🛠 Tecnologias

| Tecnologia | Uso |
|---|---|
| **React Native** | Framework principal para iOS e Android a partir de uma única base de código |
| **Expo** | Toolchain para build, distribuição e acesso a recursos nativos (câmera, galeria) |
| **TypeScript** | Tipagem estática em todo o projeto |
| **Expo Router** | Roteamento baseado em arquivos (file-based routing) |
| **Context API** | Gerenciamento de estado de autenticação |
| **Expo Camera** | Leitura de QR Codes via câmera nativa |
| **Expo Image Picker** | Seleção de fotos da galeria do dispositivo |

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- [Expo Go](https://expo.dev/go) no dispositivo físico, **ou** emulador Android/iOS configurado
- [back-expedisoft](https://github.com/gabrielseffrin/back-expedisoft) rodando e acessível

```bash
# 1. Clone o repositório
git clone https://github.com/gabrielseffrin/app-expedisoft.git
cd app-expedisoft

# 2. Instale as dependências
npm install

# 3. Configure a URL da API
# Edite services/api.ts e defina o endereço do backend:
# const BASE_URL = 'http://SEU_IP:8000'

# 4. Inicie o projeto
npx expo start
```

Escaneie o QR Code no terminal com o **Expo Go** (Android ou iOS) para abrir o aplicativo.

### Executar em emulador

```bash
# Android
npx expo start --android

# iOS (requer macOS com Xcode)
npx expo start --ios
```

> **Dica:** para testar com o backend local, substitua `localhost` pelo IP da sua máquina na rede. O Expo Go no dispositivo físico não consegue acessar `localhost` do computador.

---

## 📁 Estrutura do Projeto

```
app-expedisoft/
├── app/                     # Telas (Expo Router — file-based routing)
│   ├── (auth)/              # Telas não autenticadas (login)
│   └── (tabs)/              # Telas autenticadas (home, carregamentos)
├── components/              # Componentes reutilizáveis
├── context/                 # AuthContext — sessão global
├── services/                # Chamadas à API REST
│   └── api.ts               # Configuração base da API
└── assets/
    └── images/
        └── screenshots/     # Capturas de tela para documentação
```

---

## 🔗 Repositórios

| Repositório | Descrição |
|---|---|
| **[back-expedisoft](https://github.com/gabrielseffrin/back-expedisoft)** | API Laravel · Backend |
| **[front-expedisoft](https://github.com/gabrielseffrin/front-expedisoft)** | Plataforma Web · React + TypeScript |
| **[app-expedisoft](https://github.com/gabrielseffrin/app-expedisoft)** | ← você está aqui · App Mobile |

---

## 👨‍💻 Autor

**Gabriel Fernando Seffrin**
Tecnólogo em Sistemas para Internet — UTFPR Guarapuava (2026)
Orientador: Prof. Dr. Emerson André Fedechen

[![GitHub](https://img.shields.io/badge/GitHub-gabrielseffrin-181717?style=flat-square&logo=github)](https://github.com/gabrielseffrin)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-gabrielseffrin-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/gabriel-seffrin-369952223?utm_source=share_via&utm_content=profile&utm_medium=member_android)