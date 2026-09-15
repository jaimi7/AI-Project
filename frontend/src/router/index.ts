import { createRouter, createWebHistory } from 'vue-router'

import CreateReminderView from '../views/CreateReminderView.vue'
import EditReminderView from '../views/EditReminderView.vue'
import HomeView from '../views/HomeView.vue'
import ReminderDetailsView from '../views/ReminderDetailsView.vue'
import RemindersView from '../views/RemindersView.vue'
import SettingsView from '../views/SettingsView.vue'

export default createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/reminders', name: 'reminders', component: RemindersView },
    {
      path: '/reminders/new',
      name: 'create-reminder',
      component: CreateReminderView,
    },
    {
      path: '/reminders/:id',
      name: 'reminder-details',
      component: ReminderDetailsView,
    },
    {
      path: '/reminders/:id/edit',
      name: 'edit-reminder',
      component: EditReminderView,
    },
    { path: '/settings', name: 'settings', component: SettingsView },
  ],
})
