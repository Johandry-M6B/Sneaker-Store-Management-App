import axios from "axios";
import Swal from "sweetalert2";

let products = [];
let countId = 1;

const endpoint = "http://localhost:3000/products";

async function loadProducts() {
  try {
    const response = await axios.get(endpoint);
    products = response.data;
    if (products.length > 0) {
      countId = Math.max(...products.map(p => p.id)) + 1;
    }
    showProduct();

  } catch (error) {
    console.error("Error loading products:", error);
  }
}

loadProducts();

export function onlyLetter(input) {
  input.value = input.value
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    .replace(/^\s+/g, "")
    .toLowerCase();
}

export function onlyNumbers(input) {
  if (!input?.value) return "";

  input.value = input.value
    .replace(/[^0-9.]/g, "")
    .replace(/^\.*/g, "")
    .replace(/(\..*)\./g, "$1");
  return input.value;
}

async function addProduct() {
  const productName = document.getElementById("name").value.trim();
  const productPriece = document.getElementById("priece").value.trim();
  const productQuantity = document.getElementById("quantity").value.trim();

  if (
    !productName | !productPriece | !productQuantity ||
    isNaN(productPriece) || isNaN(productQuantity)) {
    Swal.fire({
      icon: "error",
      title: "Field empty or invalid",
      text: "Please complete all the fields correctly",
    });
    return;
  }

  const exist = products.some(
    (p) => p.name.toLowerCase() === productName.toLowerCase()
  );
  if (exist) {
    Swal.fire({
      icon: "warning",
      title: "Name repeat",
      text: "This coder is already registered",
    });
    return;
  }

  const newProduct = {
    id: countId++,
    name: productName,
    priece: productPriece,
    quantity: productQuantity,
  };


  try {
    let response = await axios.post(endpoint, newProduct);
    console.log("product added", response.data);
    products.push(newProduct);

    showProduct();
    resetForm();
    Swal.fire({
      icon: "success",
      title: "Product Add",
      text: "The product to add",
    });
  } catch (error) {
    console.error("Error adding product", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to add product to server",
    });
  }
}

function showProduct() {
  const table = document.getElementById("table-products");
  table.innerHTML = "";

  products.forEach((p) => {
    const line = document.createElement("tr");
    line.className = "product-row";

    line.innerHTML = `
      <td>${p.id}</td>
      <td><input type="text" value="${p.name}" id="name-${p.id}" oninput="onlyLetter(this)"></td>
      <td><input type="number" value="${p.priece}" id="priece-${p.id}" oninput="onlyNumbers(this)"></td>
      <td><input type="number" value="${p.quantity}" id="quantity-${p.id}" oninput="onlyNumbers(this)"></td>
      <td>
        <button class="save-btn" onclick="saveProduct(${p.id})">Edit</button>
        <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    `;

    table.appendChild(line);
  });
}

window.saveProduct = async function (id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const updatedProduct = {
    id: id,
    name: document.getElementById(`name-${id}`).value.trim(),
    priece: document.getElementById(`priece-${id}`).value.trim(),
    quantity: document.getElementById(`quantity-${id}`).value.trim()
  };


  if (!updatedProduct.name || !updatedProduct.priece || !updatedProduct.quantity) {
    Swal.fire({
      icon: "error",
      title: "Empty Fields",
      text: "All fileds reques "
    });
    return;
  }

  if (isNaN(updatedProduct.priece) || isNaN(updatedProduct.quantity )) {
    Swal.fire({
      icon: "Error",
      title: "invalid Price",
      text: "Please, Enter Priece Valid"
    });
    return;
  }

  try {
    const response = await axios.put(`${endpoint}/${id}`, updatedProduct);
    console.log("Product Update:", response.data);

    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = updatedProduct;
    }
    Swal.fire({
      icon: "success",
      title: "Update",
      text: "Product Update Correct"
    });

    showProduct();
  } catch (error) {
    console.error("Error a Update:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Product could not be updated"
    });
  }
};

window.deleteProduct = async function (id) {
  
  const result = await Swal.fire({
    title: "Are you sure?", 
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",  
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  });
  if (!result.isConfirmed) return;

  try {
    console.log('Deleting product with ID:', id);
    console.log('After products:', products);


   const response = await axios.delete(`${endpoint}/${id}`);
    console.log('Respuesta del servidor:', response);
    

    if (response.status === 200) {
    
      products = products.filter((p) => p.id !== id);
      
  
      showProduct();
      
  
      Swal.fire(
        '¡Eliminado!',
        'El producto ha sido eliminado correctamente.',
        'success'
      );
      
  
      if (products.length === 0) {
        countId = 1;
      }
    } else {
      throw new Error(`Respuesta inesperada: ${response.status}`);
    }
  } catch (error) {
    console.error('Error completo al eliminar:', error);
    
    let errorMessage = 'Error al eliminar el producto';
    
    if (error.response) {
    
      errorMessage = `Error del servidor: ${error.response.status}`;
      if (error.response.data) {
        errorMessage += ` - ${JSON.stringify(error.response.data)}`;
      }
    } else if (error.request) {
    
      errorMessage = 'No se recibió respuesta del servidor';
    } else {

      errorMessage = `Error de configuración: ${error.message}`;
    }
    
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
      footer: `ID: ${id}`
    });
  }
};

function resetForm() {
  document.getElementById("name").value = "";
  document.getElementById("priece").value = "";
  document.getElementById("quantity").value = "";
}

const btn = document.getElementById("btnsave");
btn.addEventListener("click", addProduct);

window.onlyLetter = onlyLetter;
window.onlyNumbers = onlyNumbers;
