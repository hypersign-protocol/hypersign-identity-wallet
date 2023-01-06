export function restoreState(data){
localStorage.setItem('state', data);
}


export function resetState(){
localStorage.removeItem('state');
}


