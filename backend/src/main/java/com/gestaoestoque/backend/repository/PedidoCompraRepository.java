package com.gestaoestoque.backend.repository;

import com.gestaoestoque.backend.model.PedidoCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface PedidoCompraRepository extends JpaRepository<PedidoCompra, Long> {

}
