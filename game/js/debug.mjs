
const displayDebug = true;

export default function d(...msg){
    if(displayDebug){
        msg.forEach( m => console.log(m))
    }
}