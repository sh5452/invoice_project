import {useParams} from 'react-router-dom'
function OrderDetails(){
const {id}=useParams()
return
<h2>פרטי הזמנה מספר ק {id}</h2>
}
export default OrderDetails