import * as types from './mutation-types'

export const changeActiveType = ({ commit }, type) => {
  commit(types.CHANGE_ACTIVE_TYPE, type)
}

export const changeFooterVisible = ({ commit }, isShow) => {
  commit(types.CHANGE_FOOTER_VISIBLE, isShow)
}

