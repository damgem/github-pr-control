// import { GM_config }

//     let currentRoute = ''

//     const config_desc = {
//         teamId: {
//             name: 'Team ID',
//             value: '',
//             input: 'prompt',
//             processor: 'same',
//             formatter: (name, value) => `Set Team ID for ${currentRoute}: ${value || 'not set'}`
//         }
//     }

//     const config = GM_config(config_desc)

//     function updateConfig() {
//         const routeTeamId = GM_getValue(currentRoute, '')
//         config.teamId = routeTeamId
//     }

//     function onRouteChange() {
//         currentRoute = window.location.pathname
//         updateConfig()
//     }

//     window.addEventListener(GM_config_event, (e) => {
//         if (e.detail.prop === 'teamId' && e.detail.type === 'set') {
//             GM_setValue(currentRoute, e.detail.after)
//         }
//     })

//     // Initial setup
//     onRouteChange()

//     // Observe route changes
//     const observer = new MutationObserver((mutations) => {
//         if (mutations.some((mutation) => mutation.type === 'childList')) {
//             onRouteChange()
//         }
//     })

//     observer.observe(document.body, {
//         childList: true,
//         subtree: true
//     })
