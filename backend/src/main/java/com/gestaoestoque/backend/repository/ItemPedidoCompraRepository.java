package com.gestaoestoque.backend.repository;

import com.gestaoestoque.backend.model.ItemPedidoCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface ItemPedidoCompraRepository extends JpaRepository<ItemPedidoCompra, Long> {

    List<ItemPedidoCompra> findByPedidoId(Long pedidoId);

}
