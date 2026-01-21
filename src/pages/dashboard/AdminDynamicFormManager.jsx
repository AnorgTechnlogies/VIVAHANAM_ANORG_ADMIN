// components/AdminDynamicFormManager.jsx
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_KEY;


// Field Form Modal Component
const FieldFormModal = ({ field, datalists, sections, fieldTypes, onSubmit, onClose, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    section: 'general_basic_info',
    sectionTitle: '',
    sectionOrder: 0,
    fieldOrder: 0,
    placeholder: '',
    helpText: '',
    defaultValue: '',
    isActive: true,
    isRequired: false,
    options: [],
    datalistId: '',
    validation: {
      required: false,
      minLength: '',
      maxLength: '',
      pattern: '',
      patternMessage: '',
      message: ''
    }
  });

  useEffect(() => {
    if (field) {
      setFormData({
        name: field.name || '',
        label: field.label || '',
        type: field.type || 'text',
        section: field.section || 'general_basic_info',
        sectionTitle: field.sectionTitle || '',
        sectionOrder: field.sectionOrder || 0,
        fieldOrder: field.fieldOrder || 0,
        placeholder: field.placeholder || '',
        helpText: field.helpText || '',
        defaultValue: field.defaultValue || '',
        isActive: field.isActive !== undefined ? field.isActive : true,
        isRequired: field.isRequired || false,
        options: field.options || [],
        datalistId: field.datalistId || '',
        validation: field.validation || {
          required: false,
          minLength: '',
          maxLength: '',
          pattern: '',
          patternMessage: '',
          message: ''
        }
      });
    }
  }, [field]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up data before submitting
    const submitData = {
      ...formData,
      sectionOrder: formData.sectionOrder || 0,
      fieldOrder: formData.fieldOrder || 0,
      validation: {
        ...formData.validation,
        minLength: formData.validation.minLength || null,
        maxLength: formData.validation.maxLength || null,
        pattern: formData.validation.pattern || '',
        patternMessage: formData.validation.patternMessage || '',
        message: formData.validation.message || ''
      }
    };
    
    onSubmit(submitData);
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleValidationChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        [key]: value
      }
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { label: '', value: '' }]
    }));
  };

  const updateOption = (index, key, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [key]: value } : opt
      )
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {field ? 'Edit Field' : 'Add New Field'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Field Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="firstName"
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier (lowercase, no spaces)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Display Label *</label>
              <input
                type="text"
                required
                value={formData.label}
                onChange={e => handleChange('label', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="First Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Field Type *</label>
              <select
                value={formData.type}
                onChange={e => handleChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {fieldTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Section *</label>
              <select
                value={formData.section}
                onChange={e => handleChange('section', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {sections.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section Title and Order */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
              <input
                type="text"
                value={formData.sectionTitle}
                onChange={e => handleChange('sectionTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Section Order</label>
              <input
                type="number"
                value={formData.sectionOrder}
                onChange={e => handleChange('sectionOrder', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Field Order</label>
              <input
                type="number"
                value={formData.fieldOrder}
                onChange={e => handleChange('fieldOrder', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Field Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Placeholder</label>
              <input
                type="text"
                value={formData.placeholder}
                onChange={e => handleChange('placeholder', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Help Text</label>
              <input
                type="text"
                value={formData.helpText}
                onChange={e => handleChange('helpText', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Default Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Default Value</label>
            <input
              type="text"
              value={formData.defaultValue}
              onChange={e => handleChange('defaultValue', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Datalist Selection */}
          {(formData.type === 'select' || formData.type === 'radio' || formData.type === 'datalist') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
              <select
                value={formData.datalistId}
                onChange={e => handleChange('datalistId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">Manual Options</option>
                {datalists.map(dl => (
                  <option key={dl._id} value={dl.name}>{dl.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Options for select/radio */}
          {(formData.type === 'select' || formData.type === 'radio') && !formData.datalistId && (
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-800">Options</h4>
                <button 
                  type="button" 
                  onClick={addOption} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Add Option
                </button>
              </div>
              {formData.options.map((opt, i) => (
                <div key={i} className="flex gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Label"
                    value={opt.label}
                    onChange={e => updateOption(i, 'label', e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={opt.value}
                    onChange={e => updateOption(i, 'value', e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeOption(i)} 
                    className="text-red-600 hover:text-red-800 px-3"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Validation Rules */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Rules</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => handleChange('isRequired', e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Required Field
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.validation.required}
                  onChange={(e) => handleValidationChange('required', e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Validation Required
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Length</label>
                <input
                  type="number"
                  value={formData.validation.minLength}
                  onChange={(e) => handleValidationChange('minLength', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Length</label>
                <input
                  type="number"
                  value={formData.validation.maxLength}
                  onChange={(e) => handleValidationChange('maxLength', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Validation Pattern (Regex)</label>
              <input
                type="text"
                value={formData.validation.pattern}
                onChange={(e) => handleValidationChange('pattern', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="e.g., ^[A-Za-z]+$"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pattern Error Message</label>
              <input
                type="text"
                value={formData.validation.patternMessage}
                onChange={(e) => handleValidationChange('patternMessage', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="e.g., Only letters are allowed"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">General Validation Message</label>
              <input
                type="text"
                value={formData.validation.message}
                onChange={(e) => handleValidationChange('message', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="e.g., This field is required"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm font-semibold text-gray-700">
              Active Field
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (field ? 'Update Field' : 'Create Field')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Datalist Form Modal Component
const DatalistFormModal = ({ datalist, onSubmit, onClose, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    options: []
  });

  useEffect(() => {
    if (datalist) {
      setFormData({
        name: datalist.name || '',
        options: datalist.options || []
      });
    }
  }, [datalist]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up options before submitting
    const submitData = {
      ...formData,
      options: formData.options.filter(opt => 
        opt.label && opt.value && opt.label.trim() !== '' && opt.value.trim() !== ''
      )
    };
    
    onSubmit(submitData);
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { label: '', value: '' }]
    }));
  };

  const updateOption = (index, key, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [key]: value } : opt
      )
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {datalist ? 'Edit Datalist' : 'Add New Datalist'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Datalist Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Datalist Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., religion-options"
            />
            <p className="text-xs text-gray-500 mt-1">Unique identifier for this datalist</p>
          </div>

          {/* Options */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-800">Options</h4>
              <button
                type="button"
                onClick={addOption}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
              >
                Add Option
              </button>
            </div>

            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Label"
                    value={option.label}
                    onChange={e => updateOption(index, 'label', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={option.value}
                    onChange={e => updateOption(index, 'value', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-800 px-3"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {formData.options.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-gray-500">No options added yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Option" to get started</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (datalist ? 'Update Datalist' : 'Create Datalist')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Fields Table Component
const FieldsTable = ({ fields, onEdit, onToggleStatus, onDelete }) => {
  if (fields.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No fields found</h3>
        <p className="text-gray-500 mb-4">Get started by creating your first form field.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Label</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Section</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Required</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {fields.map(field => (
            <tr key={field._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{field.label}</div>
                <div className="text-sm text-gray-500">{field.name}</div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {field.type}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{field.sectionTitle}</td>
              <td className="px-6 py-4">
                {field.isRequired ? (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    Required
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    Optional
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  field.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {field.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4">
                <button 
                  onClick={() => onEdit(field)} 
                  className="text-blue-600 hover:underline mr-4"
                >
                  Edit
                </button>
                {/* <button 
                  onClick={() => onToggleStatus(field._id, !field.isActive)} 
                  className="text-orange-600 hover:underline mr-4"
                >
                  {field.isActive ? 'Deactivate' : 'Activate'}
                </button> */}
                <button 
                  onClick={() => onDelete(field._id)} 
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Datalists Table Component
const DatalistsTable = ({ datalists, onEdit, onDelete, onAddOption, onRemoveOption }) => {
  const [newOptions, setNewOptions] = useState({});

  const handleAddOption = (datalistId) => {
    const option = newOptions[datalistId];
    if (option && option.label && option.value) {
      onAddOption(datalistId, option);
      setNewOptions(prev => ({ ...prev, [datalistId]: { label: '', value: '' } }));
    } else {
      alert('Please fill both label and value');
    }
  };

  if (datalists.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No datalists found</h3>
        <p className="text-gray-500 mb-4">Create datalists to provide dropdown options for form fields.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {datalists.map((datalist) => (
        <div key={datalist._id} className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{datalist.name}</h3>
              <p className="text-sm text-gray-600">{datalist.options.length} options</p>
            </div>
            <div>
              <button 
                onClick={() => onEdit(datalist)} 
                className="text-blue-600 hover:underline mr-4"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(datalist._id)} 
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
          
          {/* Add New Option */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Option</h4>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Label"
                value={newOptions[datalist._id]?.label || ''}
                onChange={(e) => setNewOptions(prev => ({
                  ...prev,
                  [datalist._id]: {
                    ...prev[datalist._id],
                    label: e.target.value
                  }
                }))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Value"
                value={newOptions[datalist._id]?.value || ''}
                onChange={(e) => setNewOptions(prev => ({
                  ...prev,
                  [datalist._id]: {
                    ...prev[datalist._id],
                    value: e.target.value
                  }
                }))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => handleAddOption(datalist._id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {datalist.options.map(opt => (
              <div key={opt._id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{opt.label}</div>
                  <div className="text-sm text-gray-600">{opt.value}</div>
                </div>
                <button 
                  onClick={() => onRemoveOption(datalist._id, opt._id)} 
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Admin Dynamic Form Manager Component
const AdminDynamicFormManager = () => {
  const [fields, setFields] = useState([]);
  const [datalists, setDatalists] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [editingDatalist, setEditingDatalist] = useState(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [showDatalistForm, setShowDatalistForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('fields');
  const [error, setError] = useState(null);

  const fieldTypes = ['text', 'email', 'mobileNo', 'number', 'date', 'select', 'radio', 'checkbox', 'textarea', 'file', 'datalist'];
  const sections = [
    { value: 'general_basic_info', label: 'General & Basic Info' },
    { value: 'religion_cultural', label: 'Religion & Cultural' },
    { value: 'location_education', label: 'Location & Education' },
    { value: 'address_details', label: 'Address Details' },
    { value: 'profile_personal', label: 'Profile & Personal' },
    { value: 'partner_preferences', label: 'Partner Preferences' },
    { value: 'privacy_settings', label: 'Privacy Settings' }
  ];

  const fetchWithAuth = async (url, options = {}) => {
    const getToken = () => {
      const localToken = localStorage.getItem('adminToken');
      if (localToken) return localToken;
      
      const sessionToken = sessionStorage.getItem('adminToken');
      if (sessionToken) return sessionToken;
      
      return null;
    };

    const token = getToken();
    
    console.log('🔐 Fetch with token:', !!token, 'URL:', url);
    
    if (!token) {
      console.error('No token found, redirecting to login');
      window.location.href = '/auth/sign-in';
      throw new Error('Authentication required');
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      console.error('Authentication failed - redirecting to login');
      localStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminToken');
      window.location.href = '/auth/sign-in';
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(err.message || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Enhanced loadData function with cache busting
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const [fieldsRes, datalistsRes] = await Promise.all([
        fetchWithAuth(`${BASE_URL}/form-fields?t=${Date.now()}&cache=${Math.random()}`),
        fetchWithAuth(`${BASE_URL}/datalists?t=${Date.now()}&cache=${Math.random()}`)
      ]);

      if (fieldsRes?.success) setFields(fieldsRes.data);
      if (datalistsRes?.success) setDatalists(datalistsRes.data);
    } catch (err) {
      console.error('Load data error:', err);
      setError(err.message.includes('401') ? 'Session expired. Redirecting...' : err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to clear frontend cache
  const clearFrontendCache = async () => {
    try {
      await fetch(`${BASE_URL}/clear-form-cache?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')}`
        }
      });
    } catch (error) {
      console.log('Cache clear request sent');
    }
  };

  // Function to refresh frontend forms
  const refreshFrontendForms = async () => {
    try {
      await fetch(`${BASE_URL}/form-configuration/refresh?t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')}`
        }
      });
    } catch (error) {
      console.log('Frontend refresh triggered');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

const handleFieldSubmit = async (data) => {
  setLoading(true);
  setError(null);
  try {
    console.log('📝 Field submit data:', data);
    console.log('✏️ Editing field:', editingField);
    
    // Check if field type is changing
    const isTypeChanging = editingField && editingField.type !== data.type;
    
    if (isTypeChanging) {
      console.log(`🔄 Field type change detected: ${editingField.type} → ${data.type}`);
      
      // Show detailed warning dialog
      const userConfirmed = window.confirm(
        `⚠️ FIELD TYPE CHANGE WARNING\n\n` +
        `Field: ${editingField.label || editingField.name}\n` +
        `Current Type: ${editingField.type}\n` +
        `New Type: ${data.type}\n\n` +
        `IMPORTANT: This will automatically migrate ALL existing user data for this field.\n\n` +
        `What will happen:\n` +
        `✅ All users' data will be converted\n` +
        `✅ Form caches will be cleared\n` +
        `✅ Frontend will update immediately\n\n` +
        `⚠️ This action is IRREVERSIBLE\n\n` +
        `Do you want to continue?`
      );
      
      if (!userConfirmed) {
        console.log('❌ User cancelled type change');
        setLoading(false);
        return;
      }
      
      // Call MIGRATION endpoint for type change
      console.log('🚀 Calling migration endpoint...');
      const migrationRes = await fetchWithAuth(
        `${BASE_URL}/form-fields/${editingField._id}/migrate-type`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            newType: data.type,
            oldType: editingField.type,
            fieldName: data.name || editingField.name
          })
        }
      );
      
      console.log('📦 Migration response:', migrationRes);
      
      if (migrationRes.success) {
        // Success - close modal and refresh
        setShowFieldForm(false);
        setEditingField(null);
        
        // Refresh admin data
        await loadData();
        
        // Clear frontend cache and refresh forms
        await clearFrontendCache();
        await refreshFrontendForms();
        
        // Show detailed success message
        const migrationData = migrationRes.data?.migration;
        const message = migrationData 
          ? `✅ Field type changed successfully!\n\n` +
            `Migration Report:\n` +
            `• Total Users with this field: ${migrationData.totalUsers || 0}\n` +
            `• Successfully migrated: ${migrationData.migrated || 0}\n` +
            `• Failed migrations: ${migrationData.failed || 0}\n\n` +
            `All user data has been automatically converted.\n` +
            `Frontend forms will update immediately.`
          : `✅ Field type changed successfully!`;
        
        alert(message);
        
        // Log to console for debugging
        console.log('✅ Type change successful:', {
          field: editingField.name,
          oldType: editingField.type,
          newType: data.type,
          migration: migrationData
        });
        
      } else {
        throw new Error(migrationRes.message || 'Migration failed');
      }
      
    } else {
      // NORMAL field update (no type change)
      console.log('📝 Normal field update (no type change)');
      
      const url = editingField 
        ? `${BASE_URL}/form-fields/${editingField._id}` 
        : `${BASE_URL}/form-fields`;
      
      const method = editingField ? 'PUT' : 'POST';
      
      console.log('🌐 API call:', { url, method });
      
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(data)
      });
      
      console.log('📦 API response:', res);
      
      if (res.success) {
        // Success - close modal and refresh
        setShowFieldForm(false);
        setEditingField(null);
        
        // Refresh admin data
        await loadData();
        
        // Clear frontend cache and refresh forms
        await clearFrontendCache();
        await refreshFrontendForms();
        
        alert(`✅ ${editingField ? 'Field updated' : 'Field created'} successfully!\n\nFrontend forms will update immediately.`);
        
        console.log('✅ Field saved successfully');
        
      } else {
        throw new Error(res.message || 'Failed to save field');
      }
    }
    
  } catch (err) {
    console.error('❌ Field save error:', err);
    
    // Show user-friendly error message
    let errorMessage = 'Failed to save field';
    
    if (err.message.includes('Network')) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (err.message.includes('401') || err.message.includes('403')) {
      errorMessage = 'Authentication error. Please login again.';
    } else if (err.message.includes('404')) {
      errorMessage = 'Field not found. Please refresh and try again.';
    } else if (err.message.includes('500')) {
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    
    // Also show alert for immediate feedback
    alert(`❌ Error: ${errorMessage}`);
    
  } finally {
    setLoading(false);
  }
};

  const handleDatalistSubmit = async (data) => {
    setLoading(true);
    try {
      const url = editingDatalist ? `${BASE_URL}/datalists/${editingDatalist._id}` : `${BASE_URL}/datalists`;
      const method = editingDatalist ? 'PUT' : 'POST';
      const res = await fetchWithAuth(url, { method, body: JSON.stringify(data) });
      if (res.success) {
        setShowDatalistForm(false);
        setEditingDatalist(null);
        await loadData(); // Wait for admin data to reload
        
        // Clear frontend cache and refresh forms
        await clearFrontendCache();
        await refreshFrontendForms();
        
        alert('Datalist saved successfully! Frontend forms will update immediately.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFieldStatus = async (fieldId, isActive) => {
    try {
      const result = await fetchWithAuth(`${BASE_URL}/form-fields/${fieldId}/toggle-status`, {
        method: 'PATCH'
      });
      if (result.success) {
        await loadData();
        await clearFrontendCache();
        await refreshFrontendForms();
        alert(`Field ${isActive ? 'activated' : 'deactivated'}! Frontend forms updated.`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteField = async (fieldId) => {
    if (!confirm('Are you sure you want to delete this field?')) return;
    try {
      const result = await fetchWithAuth(`${BASE_URL}/form-fields/${fieldId}`, {
        method: 'DELETE'
      });
      if (result.success) {
        await loadData();
        await clearFrontendCache();
        await refreshFrontendForms();
        alert('Field deleted successfully! Frontend forms updated.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteDatalist = async (datalistId) => {
    if (!confirm('Are you sure you want to delete this datalist?')) return;
    try {
      const result = await fetchWithAuth(`${BASE_URL}/datalists/${datalistId}`, {
        method: 'DELETE'
      });
      if (result.success) {
        await loadData();
        await clearFrontendCache();
        await refreshFrontendForms();
        alert('Datalist deleted successfully! Frontend forms updated.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const addDatalistOption = async (datalistId, option) => {
    try {
      const result = await fetchWithAuth(`${BASE_URL}/datalists/${datalistId}/options`, {
        method: 'POST',
        body: JSON.stringify(option)
      });
      if (result.success) {
        await loadData();
        await clearFrontendCache();
        await refreshFrontendForms();
        alert('Option added successfully! Frontend forms updated.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const removeDatalistOption = async (datalistId, optionId) => {
    if (!confirm('Are you sure you want to remove this option?')) return;
    try {
      const result = await fetchWithAuth(`${BASE_URL}/datalists/${datalistId}/options/${optionId}`, {
        method: 'DELETE'
      });
      if (result.success) {
        await loadData();
        await clearFrontendCache();
        await refreshFrontendForms();
        alert('Option removed successfully! Frontend forms updated.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900"> Form Manager</h1>
          <p className="text-gray-600 mt-2">Manage registration form fields & dropdown options</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg flex justify-between">
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="text-red-600 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Tabs and Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex bg-white rounded-lg shadow">
            <button
              onClick={() => setActiveTab('fields')}
              className={`px-8 py-4 font-medium rounded-l-lg ${activeTab === 'fields' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Form Fields ({fields.length})
            </button>
            <button
              onClick={() => setActiveTab('datalists')}
              className={`px-8 py-4 font-medium rounded-r-lg ${activeTab === 'datalists' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Datalists ({datalists.length})
            </button>
          </div>

          <div className="flex gap-4">
            {activeTab === 'fields' && (
              <button
                type="button"
                onClick={() => { setEditingField(null); setShowFieldForm(true); }}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 flex items-center gap-2"
                disabled={loading}
              >
                Add New Field
              </button>
            )}
            {activeTab === 'datalists' && (
              <button
                type="button"
                onClick={() => { setEditingDatalist(null); setShowDatalistForm(true); }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
                disabled={loading}
              >
                Add New Datalist
              </button>
            )}
            <button
              onClick={loadData}
              disabled={loading}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && !fields.length && !datalists.length ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'fields' && (
              <FieldsTable
                fields={fields}
                onEdit={(field) => {
                  setEditingField(field);
                  setShowFieldForm(true);
                }}
                onToggleStatus={toggleFieldStatus}
                onDelete={deleteField}
              />
            )}

            {activeTab === 'datalists' && (
              <DatalistsTable
                datalists={datalists}
                onEdit={(datalist) => {
                  setEditingDatalist(datalist);
                  setShowDatalistForm(true);
                }}
                onDelete={deleteDatalist}
                onAddOption={addDatalistOption}
                onRemoveOption={removeDatalistOption}
              />
            )}
          </>
        )}

        {/* Field Form Modal */}
        {showFieldForm && (
          <FieldFormModal
            field={editingField}
            datalists={datalists}
            sections={sections}
            fieldTypes={fieldTypes}
            onSubmit={handleFieldSubmit}
            onClose={() => { setShowFieldForm(false); setEditingField(null); }}
            loading={loading}
          />
        )}

        {/* Datalist Form Modal */}
        {showDatalistForm && (
          <DatalistFormModal
            datalist={editingDatalist}
            onSubmit={handleDatalistSubmit}
            onClose={() => { setShowDatalistForm(false); setEditingDatalist(null); }}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDynamicFormManager;