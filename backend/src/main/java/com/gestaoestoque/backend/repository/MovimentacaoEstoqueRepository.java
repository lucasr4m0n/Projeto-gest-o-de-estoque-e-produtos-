package com.gestaoestoque.backend.repository;

import com.gestaoestoque.backend.model.MovimentacaoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {

    List<MovimentacaoEstoqueRepository> findByProdutoIdOrderByDataHoraDesc(Long produtoId);

}
