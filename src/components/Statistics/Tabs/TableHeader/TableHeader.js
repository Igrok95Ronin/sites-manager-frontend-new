// TableHeader.js
// Здесь выносим логику формирования шапки (заголовка) таблицы, включая Drag and Drop для перестановки столбцов, сортировку, чекбокс «Выбрать все» и т.п

import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TableRow, TableCell, Checkbox, IconButton } from '@mui/material';
import TableSortLabel from '@mui/material/TableSortLabel';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Tooltip from '@mui/material/Tooltip';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DataObjectIcon from '@mui/icons-material/DataObject';

import FullScreenDialog from '../../HeadersJS/FullScreenDialog/FullScreenDialog.js';

// Компонент, отвечающий за «фиксированный» заголовок (headerContent)
export default function TableHeader({
  visibleColumns,
  onDragEnd,
  handleSort,
  orderBy,
  order,
  filteredData,
  checkedRows,
  handleSelectAllClick,
  setFilterByDomain,
  filterByDomain,
  filterCompanyID,
  setFilterCompanyID,
  filterAccountID,
  setFilterAccountID,
  filterKeyword,
  setFilterKeyword,
  filterFingerprint,
  setFilterFingerprint,
  filterMotionDataRaw,
  setFilterMotionDataRaw,
  filterIP,
  setFilterIP,
  allColumns,
  processedData,
  loadMoreRows,
  hasMore,
  headerFieldsDataKeys,
  jsDataFieldsDataKeys,
  setExpandedCell,
  setFormattedJSON,
  doubleOutput,
}) {
  // Вычисление для чекбокса "Выбрать все"
  const allChecked = filteredData.length > 0 && filteredData.every((row) => checkedRows[row.ID]);
  const someChecked = filteredData.some((row) => checkedRows[row.ID]) && !allChecked;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable" direction="horizontal">
        {(provided, snapshot) => (
          <TableRow
            className="statistics__headers"
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              transition: 'border 0.3s ease',
              border: snapshot.isDraggingOver ? '2px dashed #42a5f5' : 'none',
              backgroundColor: snapshot.isDraggingOver ? '#f0f8ff' : 'inherit',
            }}
          >
            {/* Select All Checkbox */}
            <TableCell className="statistics__checkall" variant="head" align="left">
              <Checkbox indeterminate={someChecked} checked={allChecked} onChange={handleSelectAllClick} />
            </TableCell>

            {/* Draggable Column Headers */}
            {visibleColumns.map((column, index) => (
              <Draggable key={column.dataKey} draggableId={column.dataKey} index={index}>
                {(providedDraggable, snapshotDraggable) => (
                  <TableCell
                    className={snapshotDraggable.isDragging ? 'dragging' : ''}
                    key={column.dataKey}
                    variant="head"
                    align="left"
                    sx={{
                      backgroundColor: snapshotDraggable.isDragging ? '#f0f8ff' : 'background.paper',
                      boxShadow: snapshotDraggable.isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : 'none',
                      transform: snapshotDraggable.isDragging ? 'scale(1.05)' : 'scale(1)',
                      transition: 'background-color 0.3s ease, transform 0.2s ease',
                      cursor: 'grab',
                    }}
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                    style={{
                      ...providedDraggable.draggableProps.style,
                      boxShadow: snapshotDraggable.isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {/* Drag Handle Icon */}
                      <DragIndicatorIcon
                        style={{
                          cursor: 'grab',
                          marginRight: '8px',
                          color: snapshotDraggable.isDragging ? '#42a5f5' : '#90a4ae',
                          transition: 'color 0.3s ease, transform 0.2s ease',
                          transform: snapshotDraggable.isDragging ? 'rotate(15deg)' : 'none',
                        }}
                      />
                      {/* Sortable Column Label */}
                      <TableSortLabel
                        active={orderBy === column.dataKey}
                        direction={orderBy === column.dataKey ? order : 'asc'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSort(column.dataKey);
                        }}
                        sx={{
                          backgroundColor: snapshotDraggable.isDragging ? '#bbdefb' : 'inherit',
                          boxShadow: snapshotDraggable.isDragging ? 'inset 0 0 8px rgba(0, 0, 0, 0.1)' : 'none',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                      {/* Дополнительные элементы (например, Tooltips, Buttons) */}
                      {column.dataKey === 'Domain' && filterByDomain && (
                        <Tooltip title="Сбросить фильтр по домену" arrow placement="top">
                          <IconButton
                            sx={{ padding: '5px 0', marginLeft: '0' }}
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterByDomain(null);
                            }}
                          >
                            <RestartAltIcon sx={{ width: '18px' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {/* Дополнительные элементы (например, Tooltips, Buttons) */}
                      {column.dataKey === 'CompanyID' && filterCompanyID && (
                        <Tooltip title="Сбросить фильтр по CompanyID" arrow placement="top">
                          <IconButton
                            sx={{ padding: '5px 0', marginLeft: '0' }}
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterCompanyID(null);
                            }}
                          >
                            <RestartAltIcon sx={{ width: '18px' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {/* Дополнительные элементы (например, Tooltips, Buttons) */}
                      {column.dataKey === 'AccountID' && filterAccountID && (
                        <Tooltip title="Сбросить фильтр по AccountID" arrow placement="top">
                          <IconButton
                            sx={{ padding: '5px 0', marginLeft: '0' }}
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterAccountID(null);
                            }}
                          >
                            <RestartAltIcon sx={{ width: '18px' }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Дополнительные элементы (например, Tooltips, Buttons) */}
                      {column.dataKey === 'Keyword' && filterKeyword && (
                        <Tooltip title="Сбросить фильтр по Keyword" arrow placement="top">
                          <IconButton
                            sx={{ padding: '5px 0', marginLeft: '0' }}
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterKeyword(null);
                            }}
                          >
                            <RestartAltIcon sx={{ width: '18px' }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Дополнительные элементы (например, Tooltips, Buttons) */}
                      {column.dataKey === 'Fingerprint' && filterFingerprint && (
                        <Tooltip title="Сбросить фильтр по Fingerprint" arrow placement="top">
                          <IconButton
                            sx={{ padding: '5px 0', marginLeft: '0' }}
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterFingerprint(null);
                            }}
                          >
                            <RestartAltIcon sx={{ width: '18px' }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Дополнительные элементы (например, Tooltips, Buttons) */}
                      {column.dataKey === 'MotionDataRaw' && filterMotionDataRaw && (
                        <Tooltip title="Сбросить фильтр по MotionDataRaw" arrow placement="top">
                          <IconButton
                            sx={{ padding: '5px 0', marginLeft: '0' }}
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterMotionDataRaw(null);
                            }}
                          >
                            <RestartAltIcon sx={{ width: '18px' }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Дополнительные элементы (например, Tooltips, Buttons) */}
                      {column.dataKey === 'IP' && filterIP && (
                        <Tooltip title="Сбросить фильтр по IP" arrow placement="top">
                          <IconButton
                            sx={{ padding: '5px 0', marginLeft: '0' }}
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterIP(null);
                            }}
                          >
                            <RestartAltIcon sx={{ width: '18px' }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Пример с FullScreenDialog */}
                      {column.dataKey === 'Accept-Language' && (
                        <FullScreenDialog
                          AcceptLanguage={<DataObjectIcon />}
                          columns={allColumns}
                          rows={processedData}
                          headerFieldsDataKeys={headerFieldsDataKeys}
                          loadMoreRows={loadMoreRows}
                          hasMore={hasMore}
                          label={'Headers'}
                          Description={'Заголовки Headers'}
                        />
                      )}
                      {column.dataKey === 'language' && (
                        <FullScreenDialog
                          AcceptLanguage={<DataObjectIcon />}
                          columns={allColumns}
                          rows={processedData}
                          headerFieldsDataKeys={jsDataFieldsDataKeys}
                          loadMoreRows={loadMoreRows}
                          hasMore={hasMore}
                          label={'JS'}
                          Description={'Данные JS'}
                        />
                      )}
                      {(column.dataKey === 'Headers' || column.dataKey === 'JsData') && (
                        <Tooltip title="Сбросить расширение JSON" arrow placement="top">
                          <IconButton
                            sx={{ padding: '5px 0', marginLeft: '-25px' }}
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedCell(null);
                              setFormattedJSON((prev) => {
                                const newState = { ...prev };
                                for (const rowId in newState) {
                                  if (newState[rowId]) {
                                    delete newState[rowId][column.dataKey];
                                    if (Object.keys(newState[rowId]).length === 0) {
                                      delete newState[rowId];
                                    }
                                  }
                                }
                                return newState;
                              });
                            }}
                          >
                            <RestartAltIcon sx={{ width: '15px' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </TableRow>
        )}
      </Droppable>
    </DragDropContext>
  );
}
