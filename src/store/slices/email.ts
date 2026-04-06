import { createSlice } from '@reduxjs/toolkit'
import type { Email, EmailState } from '@/types/apps/emailTypes'
import { db } from '@/fake-db/apps/email'

const initialState: EmailState = {
  emails: db.emails,
  filteredEmails: [],
  currentEmailId: undefined
}

export const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    filterEmails: (state, action) => {
      const { emails, folder, label, uniqueLabels } = action.payload
      state.filteredEmails = emails.filter((email: Email) => {
        if (folder === 'starred' && email.folder !== 'trash') return email.isStarred
        if (uniqueLabels.includes(label) && email.folder !== 'trash') return email.labels.includes(label)
        return email.folder === folder
      })
    },
    moveEmailsToFolder: (state, action) => {
      const { emailIds, folder } = action.payload
      state.emails = state.emails.map(email =>
        emailIds.includes(email.id) ? { ...email, folder } : email
      )
    },
    deleteTrashEmails: (state, action) => {
      const { emailIds } = action.payload
      state.emails = state.emails.filter(email => !emailIds.includes(email.id))
    },
    toggleReadEmails: (state, action) => {
      const { emailIds } = action.payload
      const doesContainUnread = state.filteredEmails
        .filter(e => emailIds.includes(e.id))
        .some(e => !e.isRead)
      const areAllRead = state.filteredEmails
        .filter(e => emailIds.includes(e.id))
        .every(e => e.isRead)
      state.emails = state.emails.map(email => {
        if (emailIds.includes(email.id) && doesContainUnread) return { ...email, isRead: true }
        if (emailIds.includes(email.id) && areAllRead) return { ...email, isRead: false }
        return email
      })
    },
    toggleLabel: (state, action) => {
      const { emailIds, label } = action.payload
      state.emails = state.emails.map(email => {
        if (emailIds.includes(email.id)) {
          return email.labels.includes(label)
            ? { ...email, labels: email.labels.filter((l: string) => l !== label) }
            : { ...email, labels: [...email.labels, label] }
        }
        return email
      })
    },
    toggleStarEmail: (state, action) => {
      const { emailId } = action.payload
      state.emails = state.emails.map(email =>
        email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
      )
    },
    getCurrentEmail: (state, action) => {
      state.currentEmailId = action.payload
      state.emails = state.emails.map(email =>
        email.id === action.payload && !email.isRead ? { ...email, isRead: true } : email
      )
    },
    navigateEmails: (state, action) => {
      const { type, emails: filteredEmails, currentEmailId } = action.payload
      const currentIndex = filteredEmails.findIndex((e: Email) => e.id === currentEmailId)
      if (type === 'next' && currentIndex < filteredEmails.length - 1) {
        state.currentEmailId = filteredEmails[currentIndex + 1].id
      } else if (type === 'prev' && currentIndex > 0) {
        state.currentEmailId = filteredEmails[currentIndex - 1].id
      }
      if (state.currentEmailId) {
        const idx = state.emails.findIndex(e => e.id === state.currentEmailId)
        if (idx !== -1) state.emails[idx].isRead = true
      }
    }
  }
})

export const {
  filterEmails,
  moveEmailsToFolder,
  deleteTrashEmails,
  toggleReadEmails,
  toggleLabel,
  toggleStarEmail,
  getCurrentEmail,
  navigateEmails
} = emailSlice.actions

export default emailSlice.reducer
