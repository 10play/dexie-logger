import { badge } from './badge'
import { stringToDOM } from './domUtils'

export const useDevtools = () => {        
  document.body.appendChild(stringToDOM(badge))
}