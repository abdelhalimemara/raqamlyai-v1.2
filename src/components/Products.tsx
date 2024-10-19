import React, { useState, useEffect } from 'react';
import { Package, Upload, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: '',
    price: 0,
    description: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again.');
    }
  }

  const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to add or update a product');
      }

      if (editingProduct) {
        const { data, error: updateError } = await supabase
          .from('products')
          .update({ ...newProduct, user_id: user.id })
          .eq('id', editingProduct.id)
          .select();

        if (updateError) throw updateError;
        console.log('Product updated successfully:', data);
      } else {
        const { data, error: insertError } = await supabase
          .from('products')
          .insert({ ...newProduct, user_id: user.id })
          .select();

        if (insertError) throw insertError;
        console.log('Product added successfully:', data);
      }
      
      fetchProducts();
      setNewProduct({ name: '', category: '', price: 0, description: '' });
      setShowAddForm(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error('Error adding/updating product:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setShowAddForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Products</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <button
        onClick={() => {
          setShowAddForm(!showAddForm);
          setEditingProduct(null);
          setNewProduct({ name: '', category: '', price: 0, description: '' });
        }}
        className="mb-4 bg-highlight text-black font-semibold py-2 px-4 rounded hover:bg-opacity-80 transition-colors"
      >
        <Plus size={20} className="inline-block mr-2" />
        {showAddForm ? 'Cancel' : 'Add New Product'}
      </button>
      {showAddForm && (
        <form onSubmit={handleAddOrUpdateProduct} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              placeholder="Product Name"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-highlight"
              required
            />
            <input
              type="text"
              name="category"
              value={newProduct.category}
              onChange={handleInputChange}
              placeholder="Category"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-highlight"
              required
            />
            <input
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              placeholder="Price"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-highlight"
              required
            />
            <textarea
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              placeholder="Description"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-highlight"
              required
            />
          </div>
          <button type="submit" className="mt-4 bg-highlight text-black font-semibold py-2 px-4 rounded hover:bg-opacity-80 transition-colors">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Package size={20} className="text-highlight mr-2" />
                    <span>{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;