package com.gestaoestoque.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface PedidoCompraRepository extends JpaRepository<PedidoCompraRepository, Long> {

}
