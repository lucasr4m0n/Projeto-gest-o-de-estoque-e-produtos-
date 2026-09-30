package com.gestaoestoque.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoqueRepository, Long> {

    List<MovimentacaoEstoqueRepository> findByProdutoIdOrderByDataHoraDesc(Long produtoId);

}
