export const booleanState = (value: boolean | string | undefined):string => {
    if(value === true || value ==='true'){
      return 'Activo'
    }else if(value === false || value === 'false' ){
      return 'Bloqueado'
    }else{return 'Bloqueado'}
}