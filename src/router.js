import {createRouter, createWebHistory} from 'vue-router'
import axios from 'axios'


import HomeView from './views/HomeView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import ProfileView from './views/ProfileView.vue'
import EmployeeView from './views/EmployeeView.vue'
import ManagerView from './views/ManagerView.vue'
import HrdashboardView from './views/HrdashboardView.vue'
import HrSearch from './views/HrSearch.vue'
// import CustomerLogin from "./components/CustomerLogin.vue"
// import CustomerRegister from "./components/CustomerRegister.vue"
// import AdminLogin from './components/AdminLogin.vue'
// import CustomerHome from './components/CustomerHome.vue'
// import ProfessionalRegister from './components/ProfessionalRegister.vue'
// import AdminHome from './components/AdminHome.vue'
// import ProLogin from './components/ProfessionalLogin.vue'
// import AddService from './components/AddService.vue'
// import AdminSearch from './components/AdminSearch.vue'
// import ProHome from './components/ProfessionalHome.vue'
// import AdminSummary from './components/AdminSummary.vue'
// import CustomerSearch from './components/CustomerSearch.vue'
// import ProRating from './components/ProfessionalRating.vue'
// import ViewPro from './components/ViewPro.vue'

const routes=[
    {name:'HomePage', path:'/', component: HomeView},
    {name:'LoginPage',path:'/login',component: LoginView},
    {name:'RegisterPage',path:'/register',component: RegisterView},
    {name:'ProfilePage', path:'/profile', component: ProfileView},
    {name:'EmployeeDashboard', path:'/employee/dashboard', component: EmployeeView, meta: { requiresAuth: false, employee: true }},
    {name:'ManagerDashboard', path:'/manager/dashboard', component: ManagerView, props: { mode: 'dashboard' }, meta: { requiresAuth: false, manager: false }},
    {name:'ManagerLeaveInsights', path:'/manager/leaves', component: ManagerView, props: { mode: 'leaves' }, meta: { requiresAuth: false, manager: false }},
    { name: 'HrDashboard', path: '/hr/dashboard', alias: ['/superadmin'], component: HrdashboardView, meta: { requiresAuth: false, superAdmin: false } },
    { name: 'HrSearch', path: '/hr/search', alias: ['/superadmin-search'], component: HrSearch, meta: { requiresAuth: false, superAdmin: false } },

    
]

const router = createRouter({
    routes:routes,
    history:createWebHistory()
})

router.beforeEach((to, from, next) => {
    const canUseStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    const getStoredUser = () => {
        if (!canUseStorage) {
            return null
        }
        return localStorage.getItem('currentUser')
    }

    const parseStoredUser = () => {
        const raw = getStoredUser()
        if (!raw) {
            return null
        }
        try {
            return JSON.parse(raw)
        } catch (error) {
            console.warn('Unable to parse cached user', error)
            return null
        }
    }

    const user = parseStoredUser()
    const roles = Array.isArray(user?.roles) ? user.roles : []
    const isSuperAdmin = roles.includes('super_admin')
    const isAdmin = roles.includes('admin')
    const isManager = user && user.employment_role === 'manager' && !isAdmin && !isSuperAdmin
    const isEmployee = user && user.employment_role === 'employee' && !isAdmin && !isSuperAdmin
    const hrRouteNames = ['HrDashboard', 'HrSearch']

    if (to.meta && to.meta.requiresAuth) {
        if (!user) {
            next({ name: 'LoginPage', query: { redirect: to.fullPath } })
            return
        }
        if (to.meta.superAdmin && !isSuperAdmin) {
            if (isManager) {
                next({ name: 'ManagerDashboard' })
                return
            }
            if (isEmployee) {
                next({ name: 'EmployeeDashboard' })
                return
            }
            if (isAdmin) {
                next({ name: 'HomePage' })
                return
            }
            next({ name: 'LoginPage', query: { redirect: to.fullPath } })
            return
        }
        if (to.meta.manager && !isManager) {
            if (isSuperAdmin) {
                next({ name: 'HrDashboard' })
                return
            }
            if (isEmployee) {
                next({ name: 'EmployeeDashboard' })
                return
            }
            if (isAdmin) {
                next({ name: 'HomePage' })
                return
            }
            next({ name: 'LoginPage', query: { redirect: to.fullPath } })
            return
        }
        if (to.meta.employee) {
            if (isManager) {
                next({ name: 'ManagerDashboard' })
                return
            }
            if (isSuperAdmin) {
                next({ name: 'HrDashboard' })
                return
            }
        }
    }

    if (to.name === 'LoginPage') {
        if (user) {
            localStorage.removeItem('currentUser')
            localStorage.removeItem('authToken')
            delete axios.defaults.headers.common['Authentication-Token']
        }
        next()
        return
    }

    if (to.name === 'EmployeeDashboard') {
        if (isManager) {
            next({ name: 'ManagerDashboard' })
            return
        }
        if (isSuperAdmin) {
            next({ name: 'HrDashboard' })
            return
        }
    }

    if (hrRouteNames.includes(to.name) && !isSuperAdmin) {
        if (isManager) {
            next({ name: 'ManagerDashboard' })
            return
        }
        if (isEmployee) {
            next({ name: 'EmployeeDashboard' })
            return
        }
        if (isAdmin) {
            next({ name: 'HomePage' })
            return
        }
        next({ name: 'LoginPage', query: { redirect: to.fullPath } })
        return
    }

    next()
})

export default router
