declare module 'react-big-calendar/lib/localizers/date-fns' {
  import { DateLocalizer } from 'react-big-calendar'
  export function dateFnsLocalizer(args: {
    format: (date: Date, format: string, options?: any) => string
    parse: (value: string, format: string) => Date
    startOfWeek: (date: Date) => Date
    getDay: (date: Date) => number
    locales: { [key: string]: any }
  }): DateLocalizer
} 