import sql from "mssql";
import config from "../../config/database.js";

class solicitudRepository {
  // Obtener los niveles de aprobación asociados a una solicitud


  // Insertar un nuevo nivel de aprobación para una solicitud
  async obtenerOrdenCompra(codigo) {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input("codigo", sql.NVarChar, codigo)
        .query(`
          SELECT oc.id_orden, oc.codigo, oc.id_centro_costo, oc.total_local, m.abrev as moneda, oc.subtotal, oc.total as monto, oc.impuesto, oc.created_at as fecha, s.usuario_solicitante as solicitante
          FROM oc.OrdenCompra oc
          inner join oc.monedas m on oc.id_moneda = m.id_moneda
          inner join oc.solicitud s on oc.id_solicitud = s.id_solicitud
          WHERE codigo = @codigo
        `);
  
      return result.recordset[0]; // Devuelve un único registro
    } catch (error) {
      console.error("Error al obtener la orden de compra:", error);
      throw error;
    }
  }
  async obtenerFlujoAprobacion(ordenCompra) {
    try {
      const pool = await sql.connect(config);
  
      // Llamar al procedimiento almacenado
      const result = await pool.request()
        .input('centroCostoId', sql.Int, ordenCompra.id_centro_costo)
        .input('totalLocal', sql.Decimal(18, 2), ordenCompra.total_local) // Precisión ajustada
        .execute('ObtenerFlujoAprobacion'); // Nombre del procedimiento almacenado
  
        console.log(result);
      // Procesar el resultado
      const flujoAprobacion = result.recordset.map(row => ({
        nivel: row.nivel,
        id: row.id,
        correo: row.correo,
      }));
  
      // Retornar el flujo de aprobación
      return flujoAprobacion;
  
    } catch (error) {
      console.error('Error al obtener el flujo de aprobación:', error);
      throw error;
    }
  }
  
  async insertarHistorialAprobacion({ idOrdenCompra, codigoOrdenCompra, aprobadorId, nivelAprobacion }) {
    try {
      const pool = await sql.connect(config);
  
      // Llamar al procedimiento almacenado
      const result = await pool.request()
        .input('idOrdenCompra', sql.Int, idOrdenCompra)
        .input('codigoOrdenCompra', sql.NVarChar, codigoOrdenCompra)
        .input('aprobadorId', sql.Int, aprobadorId)
        .input('nivelAprobacion', sql.Int, nivelAprobacion)
        .input('approvals', sql.Int, 0) // Valor por defecto
        .input('estatusId', sql.Int, 1) // Valor por defecto
        .output('id_historial', sql.Int) // ID de salida
        .execute('InsertarHistorialAprobaciones');
  
      // Retornar el ID del historial insertado
      return result.output.id_historial;
    } catch (error) {
      console.error("Error al insertar en el historial de aprobaciones:", error);
      throw error;
    }
  }
  async actualizarNivelOrdenCompra(idOrden, nivelMaximo) {
    try {
        const pool = await sql.connect(config);  // Conectamos a la base de datos
        const result = await pool.request()      // Usamos `request` para ejecutar la consulta
            .input('idOrden', sql.Int, idOrden)
            .input('nivelMaximo', sql.Int, nivelMaximo)
            .query(`
                UPDATE oc.OrdenCompra 
                SET nivel_aprobacion = @nivelMaximo
                WHERE id_orden = @idOrden
            `);

        return result.rowsAffected;  // Retorna la cantidad de filas afectadas
    } catch (error) {
        console.error("Error al actualizar el nivel de la orden de compra:", error);
        throw error;
    }
}
  
  
  
}

export default solicitudRepository;
