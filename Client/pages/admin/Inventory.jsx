import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Package, Edit, Trash2, Plus, X, Search, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // STATE TÌM KIẾM & PHÂN TRANG
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // STATE FORM (Đã thêm isFeatured)
  const [formData, setFormData] = useState({
    name: '', importPrice: '', price: '', countInStock: '', category: 'Phones', condition: 'Mới', image: '', description: '', isFeatured: false
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products/admin/all');
      setProducts(Array.isArray(res.data) ? res.data : []); 
    } catch (err) {
      console.error("Lỗi lấy sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // LỌC & TÌM KIẾM
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PHÂN TRANG
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', importPrice: '', price: '', countInStock: '', category: 'Phones', condition: 'Mới', image: '', description: '', isFeatured: false });
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      importPrice: product.importPrice || 0,
      price: product.price,
      countInStock: product.countInStock || 0,
      category: product.category || 'Phones',
      condition: product.condition || 'Mới',
      image: product.image,
      description: product.description || '',
      isFeatured: product.isFeatured || false // Load trạng thái nổi bật cũ
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts(); 
      alert("Đã xóa sản phẩm!");
    } catch (err) { alert("Lỗi khi xóa sản phẩm!"); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, formData);
        alert("Cập nhật thành công!");
      } else {
        await API.post('/products', formData);
        alert("Thêm sản phẩm thành công!");
      }
      setIsModalOpen(false);
      fetchProducts(); 
    } catch (err) {
      alert("Có lỗi xảy ra khi lưu! (F12 xem Console để biết chi tiết)");
    }
  };

  return (
    <div className="p-6 font-sans min-h-[90vh] bg-gray-50">
      
      {/* THANH CÔNG CỤ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase text-gray-800 flex items-center gap-3 border-l-4 border-red-600 pl-4">
            <Package className="text-red-600" /> Quản lý Sản Phẩm Công Nghệ
          </h1>
          <p className="text-gray-500 font-bold text-sm mt-2">
            Đang hiển thị <span className="text-red-600 font-black">{filteredProducts.length}</span> sản phẩm công nghệ trong kho
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder="Tìm kiếm tên, danh mục..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 p-3 pl-11 rounded-full outline-none focus:border-red-600 shadow-sm font-medium" 
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <button 
            onClick={handleAddNew}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gray-900 text-white font-black uppercase text-xs tracking-widest px-6 py-3.5 rounded-full hover:bg-red-600 transition-all shadow-md hover:-translate-y-0.5"
          >
            <Plus size={16} /> Thêm Sản Phẩm Công Nghệ
          </button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU SẢN PHẨM */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
        {loading ? (
          <div className="text-center py-20 font-black text-xl text-gray-400">Đang tải dữ liệu kho...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-900 text-white uppercase text-xs tracking-wider">
                <th className="p-5 font-black w-20">Ảnh</th>
                <th className="p-5 font-black">Thông tin sản phẩm</th>
                <th className="p-5 font-black text-center">Tồn kho</th>
                <th className="p-5 font-black">Giá nhập / Giá bán</th>
                <th className="p-5 font-black">Lợi nhuận</th>
                <th className="p-5 font-black text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentProducts.map(product => (
                <tr key={product._id} className="hover:bg-red-50/30 transition-colors group">
                  <td className="p-5">
                    <img src={product.image?.startsWith('http') ? product.image : `http://localhost:5000/uploads/${product.image}`} alt={product.name} className="w-14 h-14 object-cover rounded-xl border border-gray-100" />
                  </td>
                  <td className="p-5">
                    <p className="font-black text-gray-800 text-base leading-snug">{product.name}</p>
                    <span className="text-xs font-bold text-gray-400 mt-1 inline-block uppercase bg-gray-100 px-2 py-0.5 rounded">{product.category}</span>
                    <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2 shadow-sm">{product.condition || 'Mới'}</span>
                    {/* LABEL SẢN PHẨM NỔI BẬT */}
                    {product.isFeatured && (
                      <span className="text-[10px] font-black uppercase bg-yellow-400 text-white px-2 py-0.5 rounded ml-2 shadow-sm">Nổi bật</span>
                    )}
                  </td>
                  
                  <td className="p-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${
                      product.countInStock === 0 ? 'bg-red-100 text-red-700' :
                      product.countInStock < 10 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {product.countInStock === 0 ? 'Hết hàng' : `${product.countInStock} cái`}
                    </span>
                  </td>

                  <td className="p-5">
                    <div className="text-xs text-gray-500 font-bold mb-1">Vốn: {product.importPrice?.toLocaleString()}đ</div>
                    <div className="text-base text-red-600 font-black">Bán: {product.price?.toLocaleString()}đ</div>
                  </td>

                  <td className="p-5">
                    <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg font-black text-sm border border-yellow-200 shadow-sm">
                      +{(product.price - (product.importPrice || 0)).toLocaleString()}đ
                    </span>
                  </td>

                  <td className="p-5 text-center space-x-2">
                    <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 p-2.5 bg-gray-50 hover:bg-blue-50 rounded-full transition-colors"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 p-2.5 bg-gray-50 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-20 text-center font-black text-gray-400 text-xl">Không tìm thấy sản phẩm nào!</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* PHÂN TRANG */}
        {!loading && filteredProducts.length > productsPerPage && (
          <div className="flex justify-between items-center p-5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm font-bold text-gray-500">
              Trang <span className="font-black text-gray-800">{currentPage}</span> / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-600 hover:text-red-600 disabled:opacity-40 bg-white">
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-1.5 font-black text-sm">
                {[...Array(totalPages)].map((_, index) => (
                  <button key={index} onClick={() => setCurrentPage(index + 1)} className={`w-10 h-10 rounded-lg ${currentPage === index + 1 ? 'bg-red-600 text-white' : 'bg-white border hover:border-red-600 hover:text-red-600 text-gray-700'}`}>
                    {index + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-600 hover:text-red-600 disabled:opacity-40 bg-white">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl relative shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-3xl">
              <h2 className="text-2xl font-black uppercase text-red-600 border-l-4 border-red-600 pl-3">
                {editingId ? 'Sửa Sản Phẩm Công Nghệ' : 'Thêm Sản Phẩm Công Nghệ Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-600"><X size={28} /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-8">
              <form id="productForm" onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tên sản phẩm</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border-2 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50 font-bold" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-1 mb-1"><DollarSign size={16}/> Giá nhập (Vốn) *</label>
                    <input type="number" required value={formData.importPrice} onChange={e => setFormData({ ...formData, importPrice: Number(e.target.value) })} className="w-full border-2 p-3 rounded-xl outline-none focus:border-red-600 bg-gray-50 text-gray-700 font-black" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1 block">Giá bán ra *</label>
                    <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full border-2 p-3 rounded-xl outline-none focus:border-red-600 bg-red-50 text-red-600 font-black border-red-100" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tồn kho *</label>
                    <input type="number" required min="0" value={formData.countInStock} onChange={e => setFormData({ ...formData, countInStock: Number(e.target.value) })} className="w-full border-2 p-3 rounded-xl outline-none focus:border-red-600 font-black bg-blue-50 text-blue-700 border-blue-100" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full border-2 p-3 rounded-xl outline-none focus:border-red-600 font-bold bg-gray-50">
                      <option value="Phones">Điện thoại</option>
                      <option value="Laptops">Laptop</option>
                      <option value="Tablets">Máy tính bảng</option>
                      <option value="Smartwatches">Đồng hồ thông minh</option>
                      <option value="Speakers">Loa & thiết bị âm thanh</option>
                      <option value="Accessories">Phụ kiện công nghệ</option>
                      <option value="Repair">Sửa chữa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tình trạng</label>
                    <select value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="w-full border-2 p-3 rounded-xl outline-none focus:border-red-600 font-bold bg-gray-50">
                      <option value="Mới">Mới</option>
                      <option value="Like New">Like New</option>
                      <option value="99%">99%</option>
                      <option value="95%">95%</option>
                      <option value="90%">90%</option>
                      <option value="Cũ">Cũ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Link Ảnh (URL)</label>
                  <input required type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full border-2 p-3 rounded-xl outline-none focus:border-red-600 font-medium bg-gray-50" placeholder="https://..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả chi tiết *</label>
                  <textarea required rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border-2 p-3 rounded-xl outline-none focus:border-red-600 resize-none font-medium bg-gray-50"></textarea>
                </div>

                {/* CHECKBOX SẢN PHẨM NỔI BẬT */}
                <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isFeatured} 
                      onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} 
                      className="w-6 h-6 accent-yellow-500 rounded" 
                    />
                    <span className="font-black text-yellow-800 uppercase tracking-wide">Đánh dấu là Sản Phẩm Nổi Bật</span>
                  </label>
                  <p className="text-xs font-bold text-yellow-600 mt-2 ml-9">Sản phẩm này sẽ được hiển thị ưu tiên trên Trang chủ.</p>
                </div>

              </form>
            </div>

            <div className="p-6 border-t bg-white rounded-b-3xl flex justify-end gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-gray-100 text-gray-800 font-black uppercase rounded-xl hover:bg-gray-200 transition-colors">Hủy Bỏ</button>
              <button form="productForm" type="submit" className="px-8 py-3 bg-red-600 text-white font-black uppercase rounded-xl hover:bg-black shadow-lg transition-all transform hover:-translate-y-0.5">Lưu Sản Phẩm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;