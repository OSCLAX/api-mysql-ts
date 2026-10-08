import { Request, Response } from 'express';
import { pool } from '../conf/dbConnection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// 1. Obtener todos los productos activos
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM products WHERE active = TRUE'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 2. Obtener un producto por ID (solo si está activo)
export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Validar que el ID sea un entero positivo
    if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
      return res.status(400).json({ message: 'El ID debe ser un entero positivo' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ? AND active = TRUE',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado o inactivo' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error en getProductById:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 3. Crear un nuevo producto
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, stock, description, brand, img } = req.body;

    // Validar campos requeridos
    if (!name || price === undefined || stock === undefined || !description) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Validar precio mayor a 0
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ message: 'El precio debe ser un número mayor a 0' });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)',
      [name, numPrice, Number(stock), description, brand || null, img || null]
    );

    res.status(201).json({
      message: 'Producto creado exitosamente',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error en createProduct:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 4. Actualizar producto completo
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
      return res.status(400).json({ message: 'El ID debe ser un entero positivo' });
    }

    const { name, price, stock, description, brand, img } = req.body;

    if (!name || price === undefined || stock === undefined || !description) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ message: 'El precio debe ser un número mayor a 0' });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? WHERE id = ? AND active = TRUE',
      [name, numPrice, Number(stock), description, brand || null, img || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado o inactivo' });
    }

    res.status(200).json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error en updateProduct:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 5. Baja lógica (actualizar active = FALSE)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
      return res.status(400).json({ message: 'El ID debe ser un entero positivo' });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado o inactivo' });
    }

    res.status(200).json({ message: 'Producto dado de baja exitosamente' });
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 6. Cambiar exclusivamente el precio (PATCH)
export const changeProductPrice = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
      return res.status(400).json({ message: 'El ID debe ser un entero positivo' });
    }

    const { price } = req.body;
    const numPrice = Number(price);

    if (price === undefined || isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ message: 'El precio debe ser un número mayor a 0' });
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET price = ? WHERE id = ? AND active = TRUE',
      [numPrice, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado o inactivo' });
    }

    res.status(200).json({ message: 'Precio actualizado exitosamente' });
  } catch (error) {
    console.error('Error en changeProductPrice:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};