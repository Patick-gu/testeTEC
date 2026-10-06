import { useState, useMemo, useRef, useEffect } from 'react';
import { useUI, useSale, useCart } from '../../context/index';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProductCategory, Product } from '../../types/pdv';
import { ProductService } from '../../api/products';
import { api } from '../../api/api';

export const useCatalogService = () => {
  const { showToast } = useToast();
  const { setActiveTab, setWeighingProduct, setShowScaleModal, scaleWeight } = useUI();
  const { addProductToCart, cart, total } = useCart();
  const { openPaymentModal } = useSale();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ProductService.getAll();
      
      // Map backend fields to frontend expected types to prevent crashes
      const mappedData = data.map((p: any) => ({
        ...p,
        price: parseFloat(p.price) || 0,
        wholesale_price: p.wholesale_price ? parseFloat(p.wholesale_price) : undefined,
        wholesale_min_quantity: p.wholesale_min_quantity ? parseInt(p.wholesale_min_quantity, 10) : undefined,
        stock: p.stock_quantity || 0,
        unit: p.unit || 'UN',
        brand: p.brand || '',
        category: p.categoria_id || p.category || '',
        categoryLabel: p.categoria?.name || 'Sem Categoria',
        isWeighable: false, // Default unless backend adds this later
        lowStock: (p.stock_quantity || 0) < 15
      }));

      setProducts(mappedData);
    } catch (err: any) {
      console.error(err);
      setProducts([]);
      setError('Erro ao carregar produtos do servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImportLoading(true);
    try {
      await ProductService.importCsv(importFile);

      showToast("Importação concluída com sucesso!", "success");
      setShowImportModal(false);
      setImportFile(null);
      fetchProducts(); // Recarrega os produtos após upload
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      showToast("Erro na importação: " + errMsg, "error");
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadModel = async () => {
    try {
      const res = await api.get('/produtos/import/template', { responseType: 'blob' });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'produtos_modelo.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      showToast("Erro ao baixar o modelo: " + err.message, "error");
    }
  };

  // Category state
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await ProductService.getCategories();
      setDbCategories(data);
    } catch (err) {
      console.error("Erro ao carregar categorias", err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setCategoryLoading(true);
    try {
      await api.post('/categorias', { name: newCategoryName });

      await fetchCategories(); // recarrega a lista
      setShowCategoryModal(false);
      setNewCategoryName('');
      showToast("Categoria adicionada com sucesso!", "success");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message;
      showToast("Erro ao criar categoria: " + errMsg, "error");
    } finally {
      setCategoryLoading(false);
    }
  };

  // Build the unified category list
  const categories = useMemo(() => {
    const baseList: { id: string | 'all'; label: string; shortcut: string; icon: string }[] = [
      { id: 'all', label: 'TODOS OS PRODUTOS', shortcut: 'ALT+0', icon: 'apps' },
    ];
    
    // Filter to only categories that have at least one product
    const activeCategories = dbCategories.filter(c => 
      products.some(p => (p as any).categoria_id === c.id || p.category === c.id)
    );

    // Map backend categories
    const mappedDb = activeCategories.map((c, i) => ({
      id: c.id,
      label: c.name.toUpperCase(),
      shortcut: `ALT+${i + 1}`,
      icon: 'label' // Default icon for DB categories
    }));

    return [...baseList, ...mappedDb];
  }, [dbCategories, products]);

  const [showOnlyCritical, setShowOnlyCritical] = useState(false);

  // Filtered products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((prod) => {
      // Let's check both prod.category and prod.categoria_id.
      const catId = (prod as any).categoria_id || prod.category;
      const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;
      const matchesQuery =
        !q ||
        (prod.name && prod.name.toLowerCase().includes(q)) ||
        (prod.code && prod.code.toLowerCase().includes(q)) ||
        (prod.brand && prod.brand.toLowerCase().includes(q));
        
      const matchesCritical = showOnlyCritical ? prod.lowStock : true;

      return matchesCategory && matchesQuery && matchesCritical;
    });
  }, [searchQuery, selectedCategory, products, showOnlyCritical]);

  const criticalStockCount = useMemo(() => {
    return products.filter((p) => p.lowStock || p.stock < 15).length;
  }, [products]);

  const handleCardClick = (product: Product) => {
    if (product.isWeighable) {
      setWeighingProduct(product);
      setShowScaleModal(true);
    } else {
      addProductToCart(product, 1);
    }
    searchInputRef.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0) {
        handleCardClick(filteredProducts[0]);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      setActiveTab('terminal');
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ 
    name: '', code: '', price: 0, stock: 0, category: '', 
    wholesale_price: 0, wholesale_min_quantity: 0 
  });
  const [editLoading, setEditLoading] = useState(false);

  // Seleção e Exclusão (Simples ou em Massa)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const confirmDelete = async () => {
    if (itemsToDelete.length === 0) return;
    try {
      // Deletar em série (ou concorrente via Promise.all)
      await Promise.all(itemsToDelete.map(async (id) => {
        await ProductService.delete(id);
      }));
      
      showToast(itemsToDelete.length > 1 ? `${itemsToDelete.length} Produtos excluídos!` : "Produto excluído com sucesso!", "success");
      setItemsToDelete([]);
      setSelectedProducts([]); // Limpa a seleção após exclusão
      fetchProducts();
    } catch (err: any) {
      showToast("Erro ao excluir produto(s).", "error");
      setItemsToDelete([]);
    }
  };

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setEditForm({
      name: prod.name,
      code: prod.code,
      price: prod.price,
      stock: prod.stock,
      category: prod.category,
      wholesale_price: prod.wholesale_price || 0,
      wholesale_min_quantity: prod.wholesale_min_quantity || 0
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditLoading(true);

    try {
      const payload: any = {
        name: editForm.name,
        code: editForm.code,
        price: editForm.price,
        stock_quantity: editForm.stock,
        categoria_id: editForm.category
      };

      if (editForm.wholesale_min_quantity > 0 && editForm.wholesale_price > 0) {
        payload.wholesale_price = editForm.wholesale_price;
        payload.wholesale_min_quantity = editForm.wholesale_min_quantity;
      } else {
        payload.wholesale_price = null;
        payload.wholesale_min_quantity = null;
      }

      await ProductService.update(editingProduct.id, payload);

      showToast("Produto atualizado com sucesso!", "success");
      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      showToast("Erro ao editar produto: " + errMsg, "error");
    } finally {
      setEditLoading(false);
    }
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ 
    name: '', code: '', price: 0, stock: 0, category: '', 
    wholesale_price: 0, wholesale_min_quantity: 0 
  });
  const [createLoading, setCreateLoading] = useState(false);

  const openCreateModal = () => {
    setCreateForm({
      name: '', code: '', price: 0, stock: 0, category: '', 
      wholesale_price: 0, wholesale_min_quantity: 0 
    });
    setShowCreateModal(true);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const payload: any = {
        name: createForm.name,
        code: createForm.code,
        price: createForm.price,
        stock_quantity: createForm.stock,
        categoria_id: createForm.category
      };

      if (createForm.wholesale_min_quantity > 0 && createForm.wholesale_price > 0) {
        payload.wholesale_price = createForm.wholesale_price;
        payload.wholesale_min_quantity = createForm.wholesale_min_quantity;
      }

      await ProductService.create(payload);

      showToast("Produto criado com sucesso!", "success");
      setShowCreateModal(false);
      fetchProducts();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      showToast("Erro ao criar produto: " + errMsg, "error");
    } finally {
      setCreateLoading(false);
    }
  };

  return {
    cart,
    total,
    scaleWeight,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    searchInputRef,
    categories,
    filteredProducts,
    criticalStockCount,
    handleCardClick,
    handleKeyDown,
    openPaymentModal,
    setActiveTab,
    setShowScaleModal,
    isAdmin,
    loading,
    error,
    showImportModal,
    setShowImportModal,
    importFile,
    setImportFile,
    importLoading,
    handleImportSubmit,
    handleDownloadModel,
    showCategoryModal,
    setShowCategoryModal,
    newCategoryName,
    setNewCategoryName,
    categoryLoading,
    handleCreateCategory,
    dbCategories,
    itemsToDelete,
    setItemsToDelete,
    selectedProducts,
    toggleProductSelection,
    toggleSelectAll,
    confirmDelete,
    openEditModal,
    showEditModal,
    setShowEditModal,
    editForm,
    setEditForm,
    editLoading,
    handleSaveEdit,
    showOnlyCritical,
    setShowOnlyCritical,
    showCreateModal,
    setShowCreateModal,
    createForm,
    setCreateForm,
    createLoading,
    openCreateModal,
    handleSaveCreate
  };
};
