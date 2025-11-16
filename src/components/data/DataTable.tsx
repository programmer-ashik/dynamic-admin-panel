import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TagChips } from '@/components/common/TagChips';
import { TagSelector } from '@/components/object/TagSelector';
import { ColumnVisibilityToggle } from './ColumnVisibilityToggle';
import { ColumnFilter } from './ColumnFilter';
import { SaveViewDialog } from './SaveViewDialog';
import { EditableCell } from './EditableCell';
import { formatRelativeDate, cn } from '@/lib/utils';
import type { MNoteObject, ViewLayout, Collection } from '@/lib/types';
import { useUIStore } from '@/lib/store';
import { useUpdateObject, useCollections, useObjects } from '@/lib/query';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  FileText,
  CheckSquare,
  File,
  User,
  Lightbulb,
  Edit3,
  Check,
  Tag as TagIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { FileTypeIcon, getFileTypeLabel } from '@/components/viewers/FileTypeIcon';
import { QuickColumnFilter } from './QuickColumnFilter';
import { useToast } from '@/components/ui/use-toast';

interface DataTableProps {
  data: MNoteObject[];
  layout: ViewLayout;
  collection?: Collection;
}

export function DataTable({ data, layout, collection }: DataTableProps) {
  const navigate = useNavigate();
  const { wsId } = useParams();
  const setSelectedObjectId = useUIStore((state) => state.setSelectedObjectId);
  const navigateToObject = useUIStore((state) => state.navigateToObject);
  const updateObject = useUpdateObject();
  const { data: collectionsData } = useCollections();
  const { toast } = useToast();

  const allCollections = collectionsData?.items || [];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Sync column filters to parent (for advanced filters integration)
  useEffect(() => {
    // Column filters could be synced to advanced filter builder here
    // This would allow quick filters to appear in the advanced filters UI
  }, [columnFilters]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editMode, setEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  const columns = useMemo<ColumnDef<MNoteObject>[]>(() => {
    const baseColumns: ColumnDef<MNoteObject>[] = [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: 'icon',
        header: '',
        cell: ({ row }) => {
          // For document collections, show file type icon
          if (collection?.collectionType === 'document' && row.original.documentSubType) {
            return <FileTypeIcon subType={row.original.documentSubType} />;
          }
          return <span className="text-lg">{row.original.icon || '📄'}</span>;
        },
        size: 50,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => {
          return (
            <div className="flex items-center -ml-4">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8"
              >
                Title
                {column.getIsSorted() === 'asc' ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === 'desc' ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                )}
              </Button>
              <QuickColumnFilter
                column={column}
                propertyType="text"
                onApplyFilter={(value) => column.setFilterValue(value)}
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const isEditing =
            editMode && editingCell?.rowId === row.id && editingCell?.columnId === 'title';

          if (isEditing) {
            return (
              <EditableCell
                value={editValue}
                onChange={setEditValue}
                onSave={() => handleSaveEdit(row.original.id, 'title', editValue)}
                onCancel={() => setEditingCell(null)}
              />
            );
          }

          return (
            <div
              className={cn(
                'font-medium',
                editMode && 'cursor-pointer hover:bg-accent/50 rounded px-2 py-1'
              )}
              onClick={(e) => {
                if (editMode) {
                  e.stopPropagation();
                  setEditingCell({ rowId: row.id, columnId: 'title' });
                  setEditValue(row.original.title);
                }
              }}
            >
              {row.original.title}
            </div>
          );
        },
        enableColumnFilter: true,
      },
    ];

    // Add file type column for document collections
    if (collection?.collectionType === 'document') {
      baseColumns.push({
        accessorKey: 'documentSubType',
        header: ({ column }) => {
          return (
            <div className="flex items-center -ml-4">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8"
              >
                Type
                {column.getIsSorted() === 'asc' ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === 'desc' ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                )}
              </Button>
              <QuickColumnFilter
                column={column}
                propertyType="select"
                options={['metanote', 'pdf', 'docx', 'xlsx', 'email', 'image']}
                onApplyFilter={(value) => column.setFilterValue(value)}
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const subType = row.original.documentSubType;
          return (
            <div className="flex items-center gap-1.5">
              <FileTypeIcon subType={subType} className="h-3.5 w-3.5" />
              <span className="text-xs">{getFileTypeLabel(subType)}</span>
            </div>
          );
        },
        size: 120,
        enableSorting: true,
        enableColumnFilter: true,
      });
    }

    // Add collection property columns
    if (collection?.properties) {
      for (const prop of collection.properties) {
        baseColumns.push({
          id: `property_${prop.name}`,
          accessorFn: (row) => row.properties?.[prop.name],
          header: ({ column }) => {
            return (
              <div className="flex items-center -ml-4">
                <Button
                  variant="ghost"
                  onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                  className="h-8"
                >
                  {prop.name}
                  {column.getIsSorted() === 'asc' ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                  ) : column.getIsSorted() === 'desc' ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                  )}
                </Button>
                <QuickColumnFilter
                  column={column}
                  propertyType={prop.type}
                  options={prop.options}
                  onApplyFilter={(value) => column.setFilterValue(value)}
                />
              </div>
            );
          },
          cell: ({ row }) => {
            const value = row.original.properties?.[prop.name];
            const columnId = `property_${prop.name}`;
            const isEditing =
              editMode && editingCell?.rowId === row.id && editingCell?.columnId === columnId;

            // Skip editing for multi-select collection refs (complex to edit inline)
            const isMultiSelectCollectionRef = prop.type === 'collection_ref' && prop.isMultiSelect;

            if (isEditing && !isMultiSelectCollectionRef) {
              return (
                <EditableCell
                  value={editValue}
                  onChange={setEditValue}
                  onSave={() => handleSaveEdit(row.original.id, prop.name, editValue, true)}
                  onCancel={() => setEditingCell(null)}
                />
              );
            }

            // Display for collection refs (single or multi-select)
            if (prop.type === 'collection_ref') {
              const refIds = Array.isArray(value) ? value : value ? [value] : [];
              if (refIds.length === 0) {
                return <div className="text-sm text-muted-foreground">—</div>;
              }

              // Fetch referenced objects and display their titles (clickable)
              return (
                <div onClick={(e) => e.stopPropagation()}>
                  <ReferencedObjectsCell objectIds={refIds} />
                </div>
              );
            }

            const displayValue =
              value === undefined || value === null
                ? '—'
                : typeof value === 'boolean'
                  ? value
                    ? '✓'
                    : '✗'
                  : Array.isArray(value)
                    ? value.join(', ')
                    : String(value);

            return (
              <div
                className={cn(
                  'text-sm',
                  editMode &&
                    !isMultiSelectCollectionRef &&
                    value !== undefined &&
                    value !== null &&
                    'cursor-pointer hover:bg-accent/50 rounded px-2 py-1'
                )}
                onClick={(e) => {
                  if (
                    editMode &&
                    !isMultiSelectCollectionRef &&
                    value !== undefined &&
                    value !== null
                  ) {
                    e.stopPropagation();
                    setEditingCell({ rowId: row.id, columnId });
                    setEditValue(Array.isArray(value) ? value.join(', ') : String(value || ''));
                  }
                }}
              >
                {displayValue}
              </div>
            );
          },
          size: 150,
          enableColumnFilter: true,
        });
      }
    }

    // Add collection column (only when not viewing a specific collection)
    if (!collection) {
      baseColumns.push({
        accessorKey: 'collectionId',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              Collection
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const collectionId = row.original.collectionId;
          // We need access to collections here - pass via closure
          return <CollectionCell collectionId={collectionId} />;
        },
        size: 140,
        enableColumnFilter: true,
      });
    }

    // Add standard columns (Type only for All Objects view)
    if (!collection) {
      baseColumns.push({
        accessorKey: 'type',
        header: ({ column }) => {
          return (
            <div className="flex items-center -ml-4">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8"
              >
                Type
                {column.getIsSorted() === 'asc' ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === 'desc' ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                )}
              </Button>
              <QuickColumnFilter
                column={column}
                propertyType="select"
                options={['task', 'note', 'doc', 'person', 'topic', 'email', 'website']}
                onApplyFilter={(value) => column.setFilterValue(value)}
              />
            </div>
          );
        },
        cell: ({ row }) => (
          <span className="capitalize text-muted-foreground">{row.original.type}</span>
        ),
        size: 120,
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      });
    }

    baseColumns.push(
      {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
          // Only show direct tags in table, not reference tags
          const tags = row.original.tags || [];
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <TagChips
                tags={tags}
                onEntityClick={(entityId) => {
                  setSelectedObjectId(entityId);
                }}
              />
            </div>
          );
        },
        enableSorting: false,
      },
      // Referenced tags column (only for All Objects)
      ...(!collection
        ? [
            {
              accessorKey: 'referenceTags',
              header: 'Referenced',
              cell: ({ row }) => {
                const refTags = row.original.referenceTags || [];
                if (refTags.length === 0) {
                  return <span className="text-muted-foreground text-xs">—</span>;
                }
                return (
                  <div onClick={(e) => e.stopPropagation()}>
                    <TagChips
                      tags={refTags}
                      onEntityClick={(entityId) => {
                        navigateToObject(entityId);
                        setSelectedObjectId(entityId);
                      }}
                    />
                  </div>
                );
              },
              enableSorting: false,
              size: 200,
            },
          ]
        : []),
      {
        accessorKey: 'createdAt',
        header: ({ column }) => {
          return (
            <div className="flex items-center -ml-4">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8"
              >
                Created
                {column.getIsSorted() === 'asc' ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === 'desc' ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                )}
              </Button>
              <QuickColumnFilter
                column={column}
                propertyType="date"
                onApplyFilter={(value) => column.setFilterValue(value)}
              />
            </div>
          );
        },
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeDate(row.original.createdAt)}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => {
          return (
            <div className="flex items-center -ml-4">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                className="h-8"
              >
                Updated
                {column.getIsSorted() === 'asc' ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === 'desc' ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                )}
              </Button>
              <QuickColumnFilter
                column={column}
                propertyType="date"
                onApplyFilter={(value) => column.setFilterValue(value)}
              />
            </div>
          );
        },
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatRelativeDate(row.original.updatedAt)}
          </span>
        ),
        size: 120,
      }
    );

    return baseColumns;
  }, [collection, editMode, editingCell, editValue]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    enableRowSelection: true,
    getFacetedUniqueValues: (table, columnId) => {
      return () => {
        const map = new Map<string, number>();
        table.getPreFilteredRowModel().rows.forEach((row) => {
          const value = row.getValue(columnId);
          if (value !== null && value !== undefined) {
            const key = String(value);
            map.set(key, (map.get(key) || 0) + 1);
          }
        });
        return map;
      };
    },
  });

  const typeFilterOptions = [
    { label: 'Note', value: 'note', icon: FileText },
    { label: 'Task', value: 'task', icon: CheckSquare },
    { label: 'Doc', value: 'doc', icon: File },
    { label: 'Person', value: 'person', icon: User },
    { label: 'Topic', value: 'topic', icon: Lightbulb },
  ];

  const handleRowClick = (obj: MNoteObject) => {
    if (!editMode) {
      setSelectedObjectId(obj.id);
    }
  };

  const handleSaveEdit = async (
    objectId: string,
    field: string,
    value: string,
    isProperty = false
  ) => {
    if (isProperty) {
      const obj = data.find((o) => o.id === objectId);
      if (!obj) return;

      await updateObject.mutateAsync({
        id: objectId,
        patch: {
          properties: {
            ...obj.properties,
            [field]: value,
          },
        },
      });
    } else {
      await updateObject.mutateAsync({
        id: objectId,
        patch: {
          [field]: value,
        },
      });
    }

    setEditingCell(null);
    setEditValue('');
  };

  const handleSaveView = (name: string) => {
    // In a real app, this would save to the backend
    toast({
      title: 'View saved',
      description: `"${name}" has been saved successfully.`,
    });
    console.log('Saving view:', {
      name,
      layout,
      sorting,
      columnFilters,
      columnVisibility,
    });
  };

  const clearFilters = () => {
    setColumnFilters([]);
  };

  const hasActiveFilters = columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleBulkApplyTags = async (newTags: any[]) => {
    // Apply tags to all selected rows
    for (const row of selectedRows) {
      await updateObject.mutateAsync({
        id: row.original.id,
        patch: { tags: newTags },
      });
    }
    setShowBulkActions(false);
    setRowSelection({});
    toast({
      title: 'Tags applied',
      description: `Updated ${selectedCount} items`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        {/* Bulk Actions Bar */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <Button variant="outline" size="sm" onClick={() => setShowBulkActions(true)}>
                <TagIcon className="mr-2 h-3 w-3" />
                Apply Tags
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
                Clear selection
              </Button>
            </div>
          </div>
        )}

        {/* Top row: Search and actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            {table.getColumn('title') && (
              <Input
                placeholder="Search by title..."
                value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                onChange={(e) => table.getColumn('title')?.setFilterValue(e.target.value)}
                className="max-w-sm h-8"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={editMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setEditMode(!editMode);
                setEditingCell(null);
              }}
            >
              {editMode ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Done Editing
                </>
              ) : (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
            <ColumnVisibilityToggle table={table} />
            <SaveViewDialog
              layout={layout}
              sorting={sorting}
              columnFilters={columnFilters}
              columnVisibility={columnVisibility}
              onSave={handleSaveView}
            />
          </div>
        </div>

        {/* Bottom row: Column filters */}
        <div className="flex items-center gap-2">
          {table.getColumn('type') && (
            <ColumnFilter
              column={table.getColumn('type')}
              title="Type"
              options={typeFilterOptions}
            />
          )}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
              Reset
              <X className="ml-2 h-3 w-3" />
            </Button>
          )}

          {hasActiveFilters && (
            <div className="text-xs text-muted-foreground">
              {table.getFilteredRowModel().rows.length} results
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      position: 'relative',
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}

                    {/* Column resizer */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-border opacity-0 hover:opacity-100 hover:bg-primary',
                          header.column.getIsResizing() && 'opacity-100 bg-primary'
                        )}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(!editMode && 'cursor-pointer')}
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <span className="font-medium text-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
              </span>
            )}
            {table.getFilteredRowModel().rows.length} row(s)
          </div>
          {sorting.length > 0 && (
            <div>
              • Sorted by {sorting.map((s) => `${s.id} ${s.desc ? 'desc' : 'asc'}`).join(', ')}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="flex items-center gap-1 text-xs">
              <span>Page</span>
              <strong>
                {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </strong>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="h-7 text-xs rounded-md border border-input bg-background px-2"
          >
            {[10, 20, 30, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize} rows
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Tag Selector */}
      {showBulkActions && (
        <TagSelector
          open={showBulkActions}
          onClose={() => setShowBulkActions(false)}
          currentTags={[]}
          onUpdate={(tags) => handleBulkApplyTags(tags)}
        />
      )}
    </div>
  );
}

function CollectionCell({ collectionId }: { collectionId?: string }) {
  const { data: collectionsData } = useCollections();
  const collections = collectionsData?.items || [];
  const collection = collections.find((c) => c.id === collectionId);

  if (!collection) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span>{collection.icon}</span>
      <span>{collection.name}</span>
    </div>
  );
}

function ReferencedObjectsCell({ objectIds }: { objectIds: string[] }) {
  const { data: objectsData } = useObjects();
  const setSelectedObjectId = useUIStore((state) => state.setSelectedObjectId);
  const navigateToObject = useUIStore((state) => state.navigateToObject);
  const allObjects = objectsData?.items || [];

  const referencedObjects = objectIds
    .map((id) => allObjects.find((obj) => obj.id === id))
    .filter((obj) => obj !== undefined);

  if (referencedObjects.length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  // Create tag refs for display
  const tagRefs = referencedObjects.map((obj) => ({
    kind: 'entity' as const,
    key: obj.id,
    label: obj.title,
    entityId: obj.id,
  }));

  return (
    <TagChips
      tags={tagRefs}
      onEntityClick={(entityId) => {
        navigateToObject(entityId);
        setSelectedObjectId(entityId);
      }}
    />
  );
}
