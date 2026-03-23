import {Link} from 'react-router-dom'
function OrdersList(){
    return(
        <div>
            <h2>רשימת הזמנות</h2>
            <Link to='/create'></Link>
            <ul>
                <li>
                    <Link to='orders/1001'></Link>
                </li>
                <li>
                    <Link to='orders/1002'></Link>
                </li>
            </ul>
        </div>
    )
}

export default OrdersList