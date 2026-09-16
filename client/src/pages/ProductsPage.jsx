import { useEffect, useState } from 'react';
import api from '../services/api';
import './ProductsPage.css';

function ProductsPage() {

    const currentUser = JSON.parse(
        localStorage.getItem('user') || 'null'
    );

    const isSuperAdmin =
        currentUser?.role === 'super_admin';

    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] =
        useState('');

    const [products, setProducts] = useState([]);

    const [editingProduct, setEditingProduct] =
        useState(null);

    const [showForm, setShowForm] =
        useState(false);

    const [productForm, setProductForm] = useState({
        sku: '',
        name: '',
        price: '',
        packSize: ''
    });


    // ========================================
    // טעינת חברות - רק Super Admin
    // ========================================

    useEffect(() => {

        if (!isSuperAdmin) {
            return;
        }

        const fetchCompanies = async () => {

            try {

               const response =
    await api.get('/companies?parent_only=true');

                setCompanies(
                    response.data.filter(
                        company =>
                            company.name !== 'SYSTEM'
                    )
                );

            } catch (err) {

                console.error(err);

                alert(
                    err.response?.data ||
                    'שגיאה בטעינת החברות'
                );
            }
        };

        fetchCompanies();

    }, [isSuperAdmin]);


    // ========================================
    // טעינת מוצרים
    // ========================================

    useEffect(() => {

        if (isSuperAdmin) {

            if (!selectedCompanyId) {
                setProducts([]);
                return;
            }

            fetchProducts(selectedCompanyId);

        } else {

            fetchProducts();

        }

    }, [selectedCompanyId, isSuperAdmin]);


    async function fetchProducts(companyId = '') {

        try {

            let url = '/products';

            if (isSuperAdmin && companyId) {
                url += `?company_id=${companyId}`;
            }

            const response =
                await api.get(url);

            setProducts(response.data);

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data ||
                'שגיאה בטעינת המוצרים'
            );
        }
    }


    // ========================================
    // איפוס טופס
    // ========================================

    function resetForm() {

        setProductForm({
            sku: '',
            name: '',
            price: '',
            packSize: ''
        });

        setEditingProduct(null);
        setShowForm(false);
    }


    // ========================================
    // פתיחת הוספת מוצר
    // ========================================

    function handleAddProduct() {

        if (
            isSuperAdmin &&
            !selectedCompanyId
        ) {
            alert('יש לבחור חברה');
            return;
        }

        setEditingProduct(null);

        setProductForm({
            sku: '',
            name: '',
            price: '',
            packSize: ''
        });

        setShowForm(true);
    }


    // ========================================
    // פתיחת עריכת מוצר
    // ========================================

    function handleEditProduct(product) {

        setEditingProduct(product);

        setProductForm({
            sku: product.sku,
            name: product.name,
            price: product.price,
            packSize: product.pack_size
        });

        setShowForm(true);
    }


    // ========================================
    // שמירת מוצר
    // ========================================

    async function handleSubmit(e) {

        e.preventDefault();

        if (
            !productForm.sku.trim() ||
            !productForm.name.trim() ||
            productForm.price === '' ||
            productForm.packSize === ''
        ) {
            alert('יש למלא את כל השדות');
            return;
        }

        if (
            Number(productForm.packSize) <= 0
        ) {
            alert(
                'כמות במארז חייבת להיות גדולה מ־0'
            );
            return;
        }

        try {

            // =========================
            // עריכה
            // =========================

            if (editingProduct) {

                const response =
                    await api.put(
                        `/products/${editingProduct.id}`,
                        {
                            sku:
                                productForm.sku.trim(),

                            name:
                                productForm.name.trim(),

                            price:
                                Number(
                                    productForm.price
                                ),

                            packSize:
                                Number(
                                    productForm.packSize
                                )
                        }
                    );

                setProducts(prev =>
                    prev.map(product =>
                        product.id === editingProduct.id
                            ? response.data
                            : product
                    )
                );

            }

            // =========================
            // הוספה
            // =========================

            else {

                const response =
                    await api.post(
                        '/products',
                        {
                            companyId:
                                isSuperAdmin
                                    ? selectedCompanyId
                                    : currentUser.company_id,

                            sku:
                                productForm.sku.trim(),

                            name:
                                productForm.name.trim(),

                            price:
                                Number(
                                    productForm.price
                                ),

                            packSize:
                                Number(
                                    productForm.packSize
                                )
                        }
                    );

                setProducts(prev => [
                    ...prev,
                    response.data
                ]);
            }

            resetForm();

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data ||
                'שגיאה בשמירת המוצר'
            );
        }
    }


    // ========================================
    // השבתת מוצר
    // ========================================

    async function handleDeactivate(product) {

        const confirmed = window.confirm(
            `האם להשבית את המוצר "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.patch(
                `/products/${product.id}/deactivate`
            );

            setProducts(prev =>
                prev.filter(
                    item =>
                        item.id !== product.id
                )
            );

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data ||
                'שגיאה בהשבתת המוצר'
            );
        }
    }


    return (
        <div className="products-page">

            <h1>ניהול מק"טים</h1>


            {/* ========================================
                בחירת חברה - Super Admin
            ======================================== */}

            {isSuperAdmin && (

                <div className="products-company-select">

                    <label>
                        חברה
                    </label>

                    <select
                        value={selectedCompanyId}
                        onChange={(e) =>
                            setSelectedCompanyId(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            בחר חברה
                        </option>

                        {companies.map(company => (

                            <option
                                key={company.id}
                                value={company.id}
                            >
                                {company.name}
                            </option>

                        ))}

                    </select>

                </div>

            )}


            {/* ========================================
                כפתור הוספת מוצר
            ======================================== */}

            {(
                !isSuperAdmin ||
                selectedCompanyId
            ) && (

                <button
                    type="button"
                    className="add-product-button"
                    onClick={handleAddProduct}
                >
                    + הוסף מק"ט
                </button>

            )}


            {/* ========================================
                טופס מוצר
            ======================================== */}

            {showForm && (

                <div className="product-form-box">

                    <h2>
                        {editingProduct
                            ? 'עריכת מק"ט'
                            : 'הוספת מק"ט'}
                    </h2>


                    <form
                        onSubmit={handleSubmit}
                    >

                        <div className="product-form-group">

                            <label>
                                מק"ט
                            </label>

                            <input
                                type="text"
                                value={productForm.sku}
                                onChange={(e) =>
                                    setProductForm({
                                        ...productForm,
                                        sku:
                                            e.target.value
                                    })
                                }
                            />

                        </div>


                        <div className="product-form-group">

                            <label>
                                שם פריט
                            </label>

                            <input
                                type="text"
                                value={productForm.name}
                                onChange={(e) =>
                                    setProductForm({
                                        ...productForm,
                                        name:
                                            e.target.value
                                    })
                                }
                            />

                        </div>


                        <div className="product-form-group">

                            <label>
                                מחיר ליחידה
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={productForm.price}
                                onChange={(e) =>
                                    setProductForm({
                                        ...productForm,
                                        price:
                                            e.target.value
                                    })
                                }
                            />

                        </div>


                        <div className="product-form-group">

                            <label>
                                כמות במארז
                            </label>

                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={productForm.packSize}
                                onChange={(e) =>
                                    setProductForm({
                                        ...productForm,
                                        packSize:
                                            e.target.value
                                    })
                                }
                            />

                            <small>
                                לדוגמה: 4 = הלקוח יוכל
                                להזמין 4, 8, 12, 16...
                            </small>

                        </div>


                        <div className="product-form-buttons">

                            <button
                                type="submit"
                                className="save-product-button"
                            >
                                שמור
                            </button>

                            <button
                                type="button"
                                className="cancel-product-button"
                                onClick={resetForm}
                            >
                                ביטול
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ========================================
                רשימת מוצרים
            ======================================== */}

            {isSuperAdmin &&
                !selectedCompanyId ? (

                <p className="products-message">
                    בחרי חברה כדי לראות את המק"טים שלה
                </p>

            ) : products.length === 0 ? (

                <p className="products-message">
                    אין מק"טים פעילים לחברה זו
                </p>

            ) : (

                <div className="products-table-wrapper">

                    <table className="products-table">

                        <thead>

                            <tr>

                                <th>
                                    מק"ט
                                </th>

                                <th>
                                    שם פריט
                                </th>

                                <th>
                                    מחיר
                                </th>

                                <th>
                                    כמות במארז
                                </th>

                                <th>
                                    פעולות
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {products.map(product => (

                                <tr
                                    key={product.id}
                                >

                                    <td>
                                        {product.sku}
                                    </td>

                                    <td>
                                        {product.name}
                                    </td>

                                    <td>
                                        {product.price} ₪
                                    </td>

                                    <td>
                                        {product.pack_size}
                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEditProduct(
                                                    product
                                                )
                                            }
                                        >
                                            עריכה
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeactivate(
                                                    product
                                                )
                                            }
                                        >
                                            השבת
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}

export default ProductsPage;